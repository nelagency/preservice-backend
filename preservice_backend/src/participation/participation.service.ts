import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AssignDto, BulkAssignDto, CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import { InjectModel } from '@nestjs/mongoose';
import { EventDocument, EventRoleEnum } from 'src/events/entities/event.entity';
import { Model, Types } from 'mongoose';
import { AssignmentStatus, CandidatureStatus, Participation, ParticipationDocument } from './entities/participation.entity';
import { MailService } from 'src/mail/mail.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class ParticipationService {
  constructor(
    @InjectModel(Participation.name) private model: Model<ParticipationDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    private readonly mail: MailService,
    private readonly notifications: NotificationsService,
  ) { }

  async apply(eventId: string, serveurId: string, notes?: string) {
    const event = await this.eventModel.findById(eventId).lean();
    if (!event) throw new NotFoundException('Event not found');

    try {
      return await this.model.create({
        event: new Types.ObjectId(eventId),
        serveur: new Types.ObjectId(serveurId),
        candidatureStatus: CandidatureStatus.pending,
        notes,
      });
    } catch (e: any) {
      if (e?.code === 11000) {
        throw new BadRequestException('Déjà candidat sur cet évènement');
      }
      throw e;
    }
  }

  async applyEvent(eventId: string, serveurId: string, notes?: string, adminIds?: string[]) {
    const event = await this.eventModel.findById(eventId).lean();
    if (!event) throw new NotFoundException('Event not found');

    try {
      const apply = await this.model.create({
        event: new Types.ObjectId(eventId),
        serveur: new Types.ObjectId(serveurId),
        candidatureStatus: CandidatureStatus.pending,
        notes,
      });
      await this.notifications.pushToAdmins({
        type: 'PARTICIPATION_REQUESTED',
        payload: { eventId, serveurId },
        actorId: serveurId,
        title: 'Demande de participation',
        message: 'Un serveur a postulé à un événement',
      });
      return apply;
    } catch (e: any) {
      if (e?.code === 11000) {
        throw new BadRequestException('Déjà candidat sur cet évènement');
      }
      throw e;
    }
  }

  async setCandidatureStatus(eventId: string, participationId: string, status: CandidatureStatus) {
    const before = await this.model.findById(participationId).select('candidatureStatus').lean();

    const doc = await this.model.findByIdAndUpdate(
      participationId,
      {
        candidatureStatus: status,
        approvedAt: status === CandidatureStatus.approved ? new Date() : undefined,
      },
      { new: true }
    )
      .populate('serveur', 'email nom prenom')
      .lean();
    if (!doc) throw new NotFoundException('Participation not found');
    // Envoi mail si transition vers "approved"
    const justApproved =
      status === CandidatureStatus.approved && before?.candidatureStatus !== CandidatureStatus.approved;

    if (justApproved) {
      const event = await this.eventModel.findById(eventId).lean();
      if (event && (doc as any).serveur?.email) {
        await this.mail.participationApproved((doc as any).serveur, event, {
          // Tu peux surcharger ici :
          // subject: 'Sujet custom',
          // intro: 'Intro custom <strong>HTML</strong>',
          // outro: 'Outro custom',
          // ctaLabel: 'Voir la mission',
          // ctaHref: `${process.env.FRONTEND_BASE_URL}/serveur/evenements/${event._id}`,
        });
      }
    }

    return doc;
  }

  async setCandidatureStatusEvent(eventId: string, participationId: string, status: CandidatureStatus, adminId: string,) {
    const before = await this.model.findById(participationId).select('candidatureStatus').lean();

    const doc = await this.model.findByIdAndUpdate(
      participationId,
      {
        candidatureStatus: status,
        approvedAt: status === CandidatureStatus.approved ? new Date() : undefined,
      },
      { new: true }
    ).populate('serveur', 'email nom prenom').lean();

    if (!doc) throw new NotFoundException('Participation not found');
    // Envoi mail si transition vers "approved"
    const justApproved =
      status === CandidatureStatus.approved && before?.candidatureStatus !== CandidatureStatus.approved;

    const serveurIdStr =
      (doc as any)?.serveur?._id?.toString?.() ??
      (doc as any)?.serveur?.toString?.();

    if (justApproved && serveurIdStr) {
      const event = await this.eventModel.findById(eventId).lean();
      await this.notifications.pushToServeurs({
        type: 'PARTICIPATION_APPROVED',
        serveurIds: [doc.serveur._id.toString()],
        payload: { eventId },
        actorId: adminId,
        title: 'Participation confirmée',
        message: `Vous êtes affecté sur un événement ${event?.title}`,
      });
      if (event && (doc as any).serveur?.email) {
        await this.mail.participationApproved((doc as any).serveur, event);
      }
    }

    return doc;
  }

  /*
  async assignRole(eventId: string, participationId: string, dto: AssignDto) {
    const event = await this.eventModel.findById(eventId).lean();
    if (!event) throw new NotFoundException('Event not found');

    // Capacité ?
    await this.ensureCapacity(eventId, event, dto.role, participationId);

    const doc = await this.model.findOneAndUpdate(
      { _id: participationId, event: eventId, candidatureStatus: CandidatureStatus.approved },
      {
        role: dto.role,
        assignmentStatus: dto.assignmentStatus ?? AssignmentStatus.provisional,
        assignedAt: new Date(),
      },
      { new: true }
    );
    if (!doc) throw new BadRequestException('Participation introuvable ou non approuvée');
    return doc;
  }*/

  async assignRole(eventId: string, participationId: string, dto: AssignDto) {
    const event = await this.eventModel.findById(eventId).lean();
    if (!event) throw new NotFoundException('Event not found');

    // Capacité ?
    await this.ensureCapacity(eventId, event, dto.role, participationId);

    const doc = await this.model.findByIdAndUpdate(
      participationId,
      {
        role: dto.role,
        assignmentStatus: dto.assignmentStatus ?? AssignmentStatus.provisional,
        assignedAt: new Date(),
      },
      { new: true }
    );
    if (!doc) throw new BadRequestException('Participation introuvable ou non approuvée');
    return doc;
  }

  private async ensureCapacity(eventId: string, event: any, role: EventRoleEnum, excludeParticipationId?: string) {
    const req = (event.positions ?? []).find((p: any) => p.role === role);
    if (!req?.capacity) return; // pas de limite

    const count = await this.model.countDocuments({
      event: eventId,
      role,
      assignmentStatus: { $in: [AssignmentStatus.provisional, AssignmentStatus.confirmed] },
      ...(excludeParticipationId ? { _id: { $ne: excludeParticipationId } } : {}),
    });
    if (count >= req.capacity) {
      throw new BadRequestException(`Capacité atteinte pour le poste ${role}`);
    }
  }

  /** Confirmer toutes les affectations provisoires */
  async confirmAll(eventId: string) {
    await this.model.updateMany(
      { event: eventId, assignmentStatus: AssignmentStatus.provisional },
      { $set: { assignmentStatus: AssignmentStatus.confirmed } }
    );
  }

  async confirmAllEvent(eventId: string) {
    await this.model.updateMany(
      { event: eventId, assignmentStatus: AssignmentStatus.provisional },
      { $set: { assignmentStatus: AssignmentStatus.confirmed } }
    );
  }

  /** Bulk replace (pour ton DnD): on remplace toutes les affectations d'un event par ce mapping */
  async bulkReplaceAssignments(eventId: string, payload: BulkAssignDto) {
    const event = await this.eventModel.findById(eventId).lean();
    if (!event) throw new NotFoundException('Event not found');

    // Capacité par rôle
    const byRole: Record<string, number> = {};
    for (const a of payload.assignments) {
      byRole[a.role] = (byRole[a.role] ?? 0) + 1;
    }
    for (const role of Object.keys(byRole) as EventRoleEnum[]) {
      const req = (event.positions ?? []).find((p: any) => p.role === role);
      if (req?.capacity && byRole[role] > req.capacity) {
        throw new BadRequestException(`Dépassement de capacité pour ${role} (${byRole[role]}>${req.capacity})`);
      }
    }

    // Transaction: supprimer anciennes assignations + upsert nouvelles
    const session = await this.model.db.startSession();
    await session.withTransaction(async () => {
      // 1) mettre assignmentStatus=none + role=null pour tout le monde de cet event
      await this.model.updateMany(
        { event: eventId },
        { $set: { role: null, assignmentStatus: AssignmentStatus.none } },
        { session }
      );

      // 2) appliquer les nouvelles (upsert)
      for (const a of payload.assignments) {
        await this.model.updateOne(
          { event: eventId, serveur: a.serveurId },
          {
            $set: {
              candidatureStatus: CandidatureStatus.approved, // on suppose validé si affecté
              role: a.role,
              assignmentStatus: a.assignmentStatus ?? AssignmentStatus.provisional,
              assignedAt: new Date(),
            },
          },
          { upsert: true, session }
        );
      }
    });
    session.endSession();
  }

  /** KPIs pour panneau */
  async kpis(eventId: string) {
    const [confirmed, pending, assigned, totalReq] = await Promise.all([
      this.model.countDocuments({ event: eventId, assignmentStatus: AssignmentStatus.confirmed }),
      this.model.countDocuments({
        event: eventId,
        candidatureStatus: CandidatureStatus.pending,
      }),
      this.model.countDocuments({
        event: eventId,
        role: { $ne: null },
        assignmentStatus: { $in: [AssignmentStatus.provisional, AssignmentStatus.confirmed] },
      }),
      this.totalSlots(eventId),
    ]);

    const unassigned = Math.max(totalReq - assigned, 0);
    return { confirmed, pending, unassigned, total: totalReq };
  }

  private async totalSlots(eventId: string) {
    const event = await this.eventModel.findById(eventId).lean();
    const sum = (event?.positions ?? []).reduce((acc: number, p: any) => acc + (p.capacity ?? 0), 0);
    // fallback si pas de positions configurées: total = affectations existantes
    if (!sum) {
      return this.model.countDocuments({ event: eventId });
    }
    return sum;
  }

  async findByEvent(eventId: string) {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException('eventId invalide');
    }
    return this.model
      .find({ event: new Types.ObjectId(eventId) })
      .populate('serveur', 'nom prenom status email')
      .populate('event')
      .lean()
  }

  async findByServeur(serveurId: string) {
    if (!Types.ObjectId.isValid(serveurId)) {
      throw new BadRequestException('serveurId invalide');
    }
    return this.model
      .find({ serveur: new Types.ObjectId(serveurId) })
      .populate('serveur', 'event')
      .lean()
  }

  create(createParticipationDto: CreateParticipationDto) {
    return 'This action adds a new participation';
  }

  findAll() {
    return this.model.find().populate('serveur', 'event');
  }

  findOne(id: number) {
    return this.model.findById(id).populate('serveur', 'event');
  }

  update(id: number, updateParticipationDto: UpdateParticipationDto) {
    return `This action updates a #${id} participation`;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('id invalide');
    const doc = await this.model.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException('Participation not found');
    return { ok: true };
  }
}
