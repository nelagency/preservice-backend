import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateServeurDto } from './dto/create-serveur.dto';
import { UpdateServeurDto } from './dto/update-serveur.dto';
import { Serveur, ServeurDocument, ServeurStatus } from './entities/serveur.entity';
import * as bcrypt from 'bcryptjs';
import { Event, EventDocument } from 'src/events/entities/event.entity';
import { Participation, ParticipationDocument } from 'src/participation/entities/participation.entity';

const SALT_ROUNDS = 10;
const sanitizeEmail = (e?: string) => (e ?? '').trim().toLowerCase();

@Injectable()
export class ServeurService {
  constructor(
    @InjectModel(Serveur.name) private model: Model<ServeurDocument>,
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
    @InjectModel(Participation.name) private readonly participationModel: Model<ParticipationDocument>,
  ) { }

  /** CRUD par défaut **/
  async create(dto: CreateServeurDto) {
    const email = sanitizeEmail(dto.email);
    const exists = await this.model.exists({ email });
    if (exists) throw new ConflictException('Email déjà utilisé');

    const hashed = await bcrypt.hash(dto.mot_passe, SALT_ROUNDS);
    const created = await this.model.create({
      ...dto,
      email,
      mot_passe: hashed
    });
    const plain = created.toObject();
    delete (plain as any).mot_passe;
    return plain;
  }

  findAll() {
    return this.model.find({}, { mot_passe: 0 }).sort({ nom: 1, prenom: 1 }).lean();;
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id, { mot_passe: 0 }).lean();
    if (!doc) throw new NotFoundException('Serveur not found');
    return doc;
  }

  async update(id: string, dto: UpdateServeurDto) {
    const update = { ...dto };
    if (dto.email) {
      update.email = sanitizeEmail(dto.email);
      const conflict = await this.model.exists({ _id: { $ne: id }, email: update.email });
      if (conflict) throw new ConflictException('Email déjà utilisé');
    }
    if (dto.mot_passe) {
      update.mot_passe = await bcrypt.hash(dto.mot_passe, SALT_ROUNDS);
    }
    const updated1 = await this.model.findByIdAndUpdate(id, { $set: update }, { new: true, fields: { mot_passe: 0 } }).lean();
    if (!updated1) throw new NotFoundException('Serveur not found');
    return updated1;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Serveur not found');
    return { success: true };
  }

  /** Statuts de serveur (key/value) **/
  serveurStatusesKV() {
    return Object.entries(ServeurStatus).map(([key, value]) => ({ key, value }));
  }

  async listAssignedEvents(serverId: string) {
    const sid = new Types.ObjectId(serverId);
    const parts = await this.participationModel.find({ serveur: sid }).populate('event').lean();

    // Map → DTO attendu côté front
    return parts.map(p => {
      const ev = p.event as any;
      const iso = (ev?.startdate instanceof Date ? ev.startdate.toISOString().slice(0, 10) : (ev?.startdate || ''));
      return {
        _id: ev?._id?.toString() || p._id.toString(),
        title: ev?.title || 'Événement',
        date: iso,
        role: (p.role as any) || 'Non assigné',
        active: !!ev && new Date(ev.startdate) <= new Date() ? true : false, // adapte ta logique "active"
      };
    });
  }

  async changePassword(id: string, { currentPassword, newPassword }: { currentPassword: string; newPassword: string }) {
    const srv = await this.model.findById(id);
    if (!srv) throw new NotFoundException('Serveur introuvable');

    const hashField = srv.mot_passe;

    const ok = await bcrypt.compare(currentPassword, hashField);
    if (!ok) {
      throw new Error('Mot de passe actuel invalide');
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    // sauvegarde sous le bon champ
    if (typeof srv.mot_passe !== 'undefined') srv.mot_passe = newHash as any;

    (srv as any).passwordChangedAt = new Date();

    await srv.save();

    return { success: true };
  }
}
