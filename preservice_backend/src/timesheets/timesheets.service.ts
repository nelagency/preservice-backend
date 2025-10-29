import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Timesheet, TimesheetDocument } from './entities/timesheet.entity';
import { ReviewTimesheetDto } from './dto/review-timesheet.dto';
import { Event, EventDocument } from '../events/entities/event.entity';
import { Participation, ParticipationDocument } from 'src/participation/entities/participation.entity';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { Serveur, ServeurDocument } from 'src/serveur/entities/serveur.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PayTimesheetDto } from './dto/pay-timesheet.dto';

@Injectable()
export class TimesheetsService {
    constructor(
        @InjectModel(Timesheet.name) private tsModel: Model<TimesheetDocument>,
        @InjectModel(Event.name) private eventModel: Model<EventDocument>,
        @InjectModel(Serveur.name) private serveurModel: Model<ServeurDocument>,
        @InjectModel(Participation.name) private partModel: Model<ParticipationDocument>,
        private readonly notifications: NotificationsService
    ) { }

    private computeWorkedMinutes(start: Date, end: Date, breakMin: number) {
        const diff = Math.max(0, Math.floor((+end - +start) / 60000));
        return Math.max(0, diff - (breakMin || 0));
    }

    async submitForEvent(eventId: string, serveurId: string, dto: CreateTimesheetDto) {
        const event = await this.eventModel.findById(eventId);
        if (!event) throw new NotFoundException('Event not found');

        const serveur = await this.serveurModel.findById(serveurId);
        if (!serveur) throw new NotFoundException('Serveur not found');

        // règle : autorisé si event terminé OU date passée
        const now = new Date();
        const eventDate = new Date(event.startdate ?? now);
        const isTermine = event.status === 'Terminé';
        if (!isTermine && eventDate > now) throw new ForbiddenException('Timesheet not allowed before event end');

        // doit être un participant approuvé
        const approvedPart = await this.partModel.findOne({
            event: new Types.ObjectId(eventId),
            candidatureStatus: 'approved',
            $or: [
                { serveur: new Types.ObjectId(serveurId) },
                { 'serveur._id': new Types.ObjectId(serveurId) }, // selon populate
            ],
        });
        if (!approvedPart) throw new ForbiddenException('Not an approved participant');

        const start = new Date(dto.startAt);
        const end = new Date(dto.endAt);
        if (!(start < end)) throw new BadRequestException('endAt must be after startAt');

        const workedMinutes = this.computeWorkedMinutes(start, end, dto.breakMinutes);
        if (workedMinutes <= 0) throw new BadRequestException('worked minutes must be > 0');

        // upsert (1 seul timesheet par (event, serveur))
        const doc = await this.tsModel.findOneAndUpdate(
            { event: event._id, serveur: new Types.ObjectId(serveurId) },
            {
                $set: {
                    startAt: start, endAt: end,
                    breakMinutes: dto.breakMinutes,
                    workedMinutes, note: dto.note ?? null,
                    status: 'submitted',
                    validatedBy: null, validatedAt: null, validationComment: null,
                },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        await this.notifications.pushToAdmins({
            type: 'TIMESHEET_SUBMITTED',
            payload: { eventId, timesheetId: doc.id.toString() },
            actorId: serveurId,
            title: 'Feuille d’heures soumise',
            message: 'Un serveur a soumis ses horaires',
        });

        return doc;
    }

    async getMineForEvent(eventId: string, serveurId: string) {
        const doc = await this.tsModel.findOne({ event: eventId, serveur: serveurId });
        if (!doc) throw new NotFoundException('No timesheet');
        return doc;
    }

    async listPending() {
        const list = this.tsModel
            .find({ status: 'submitted' })
            .populate('event')
            .populate('serveur')
            .sort({ createdAt: -1 })
            .lean();
        return list;
    }

    async review(timesheetId: string, reviewerId: string, body: ReviewTimesheetDto) {
        const ts = await this.tsModel.findById(timesheetId);
        if (!ts) throw new NotFoundException('Timesheet not found');
        if (ts.status !== 'submitted') throw new BadRequestException('Timesheet already reviewed');

        ts.status = body.decision;
        ts.validationComment = body.comment! ?? null;
        ts.validatedBy = new Types.ObjectId(reviewerId);
        ts.validatedAt = new Date();
        await ts.save();

        const serveurIdStr =
            (ts as any)?.serveur?._id?.toString?.() ??
            (ts as any)?.serveur?.toString?.();

        if (serveurIdStr) {
            await this.notifications.pushToServeurs({
                type: 'TIMESHEET_REVIEWED',
                serveurIds: [serveurIdStr],
                payload: {
                    eventId: ts.event.toString(),
                    timesheetId: ts.id.toString(),
                    status: ts.status,
                    comment: ts.validationComment,
                },
                actorId: reviewerId,       // acteur = admin User
                actorModel: 'User',
                title: ts.status === 'approved' ? 'Feuille approuvée' : 'Feuille rejetée',
                message: ts.validationComment || undefined,
            });
        }
        return ts;
    }

    // historiques
    /*
    async listForServeur(serveurId: string) {
        const list = this.tsModel.find({ serveur: serveurId }).populate('event').sort({ createdAt: -1 }).lean();
        return list;
    } 
    */

    async listForEvent(eventId: string) {
        const list = this.tsModel.find({ event: eventId }).populate('serveur').sort({ createdAt: -1 }).lean()
        return list;
    }

    async listForServeur(serveurId: string) {
        // On accepte soit un string, soit un ObjectId; si string valide => cast
        const sid = Types.ObjectId.isValid(serveurId) ? new Types.ObjectId(serveurId) : serveurId;

        return this.tsModel
            .find({ serveur: sid as any })      // le cast assure l’égalité sur ObjectId
            .populate('event')
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }

    async listForServeurSmart(userOrServeurId: string) {
        const id = Types.ObjectId.isValid(userOrServeurId) ? new Types.ObjectId(userOrServeurId) : userOrServeurId;
        // 1) essai direct (le sub est déjà un Serveur._id)
        let list = await this.tsModel.find({ serveur: id as any }).populate('event').sort({ createdAt: -1 }).lean().exec();
        if (list.length) return list;
        // 2) fallback: retrouver le Serveur via son user
        const srv = await this.serveurModel.findOne({ user: id as any }).lean().exec();
        if (!srv?._id) return [];
        return this.tsModel.find({ serveur: srv._id }).populate('event').sort({ createdAt: -1 }).lean().exec();
    }

    async pay(timesheetId: string, adminId: string, dto: PayTimesheetDto) {
        const ts = await this.tsModel.findById(timesheetId);
        if (!ts) throw new NotFoundException('Timesheet not found');

        if (ts.status !== 'approved') {
            throw new BadRequestException('Cannot pay a non-approved timesheet');
        }

        const amt = Number(dto.amount);
        if (!isFinite(amt) || amt <= 0) {
            throw new BadRequestException('Invalid amount');
        }

        ts.payments.push({
            amount: amt,
            note: dto.note,
            createdBy: new Types.ObjectId(adminId),
            createdAt: new Date(),
        } as any);

        ts.paidAmount = (ts.paidAmount || 0) + amt;

        if (dto.finalize) {
            ts.paymentStatus = 'paid';
            ts.paidAt = new Date();
            ts.paidBy = new Types.ObjectId(adminId);
        } else {
            ts.paymentStatus = ts.paidAmount > 0 ? 'partial' : 'unpaid';
        }

        await ts.save();

        // Option: notifier le serveur du paiement
        const serveurIdStr =
            (ts as any)?.serveur?._id?.toString?.() ??
            (ts as any)?.serveur?.toString?.();

        if (serveurIdStr) {
            await this.notifications.pushToServeurs({
                type: 'TIMESHEET_PAID',
                serveurIds: [serveurIdStr],
                payload: { timesheetId: ts.id.toString(), amount: amt, finalize: !!dto.finalize },
                actorId: adminId,          // acteur = admin User
                actorModel: 'User',
                title: dto.finalize ? 'Paiement finalisé' : 'Paiement enregistré',
            });
        }

        return ts;
    }
}