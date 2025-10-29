import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument, EventStatusEnum, EventTypeEnum } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Notification, NotificationDocument } from 'src/notifications/entities/notification.entity';
import { NotificationsService } from 'src/notifications/notifications.service';

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function startOfNextMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
}
function startOfLastMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() - 1, 1, 0, 0, 0, 0);
}
function pctChange(curr: number, prev: number) {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private model: Model<EventDocument>,
    private readonly notif: NotificationsService
  ) { }

  /** CRUD par défaut **/
  async create(dto: CreateEventDto) {
    const payload: any = { ...dto };

    if (dto.serveurs) payload.serveurs = dto.serveurs.map((s) => new Types.ObjectId(s));
    if (dto.startdate) payload.date = new Date(dto.startdate);
    if (dto.enddate) payload.date = new Date(dto.enddate);

    const created = await this.model.create(payload);

    return created.toJSON();
  }

  async createEvent(dto: CreateEventDto, authorId: string, serveurIdsCiblés: string[]) {
    const payload: any = { ...dto };

    if (dto.serveurs) payload.serveurs = dto.serveurs.map((s) => new Types.ObjectId(s));
    if (dto.startdate) payload.date = new Date(dto.startdate);
    if (dto.enddate) payload.date = new Date(dto.enddate);

    const created = await this.model.create(payload);

    await this.notif.pushToServeurs({
      type: 'EVENT_PUBLISHED',
      serveurIds: serveurIdsCiblés,
      payload: { eventId: created.id.toString() },
      actorId: authorId,
      title: 'Nouvel événement publié',
      message: created.description,
    });

    return created.toJSON();
  }

  findAll() {
    return this.model.find().sort({ startdate: -1 }).populate('serveurs');
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).populate('serveurs');

    if (!doc) throw new NotFoundException('Event not found');

    return doc;
  }

  async update(id: string, dto: UpdateEventDto) {
    const payload: any = { ...dto };

    if (dto.serveurs) payload.serveurs = dto.serveurs.map((s) => new Types.ObjectId(s));
    if (dto.startdate) payload.date = new Date(dto.startdate);
    if (dto.enddate) payload.date = new Date(dto.enddate);

    const updated = await this.model.findByIdAndUpdate(id, payload, { new: true });

    if (!updated) throw new NotFoundException('Event not found');

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Event not found');
    return { success: true };
  }

  /** KPI (mois en cours vs mois précédent) **/
  async kpi() {
    const now = new Date();
    const thisStart = startOfMonth(now);
    const nextStart = startOfNextMonth(now);
    const lastStart = startOfLastMonth(now);

    // On évalue la "date d'événement" = date || createdAt
    const dateExpr = { $ifNull: ['$startdate', '$createdAt'] };

    // Fenêtres : mois courant / mois précédent (sur dateExpr)
    const thisMonthMatch = {
      $expr: { $and: [{ $gte: [dateExpr, thisStart] }, { $lt: [dateExpr, nextStart] }] }
    };
    const lastMonthMatch = {
      $expr: { $and: [{ $gte: [dateExpr, lastStart] }, { $lt: [dateExpr, thisStart] }] }
    };

    // Statuts acceptés comme "confirmé" (selon données que tu as pu insérer avant)
    const confirmedStatuses = ['confirme', 'confirmé', 'confirmed', 'CONFIRME', 'CONFIRMED'];

    // Somme robuste même si amount est string
    const amountNumberExpr = {
      $toDouble: {
        $ifNull: [
          { $cond: [{ $isNumber: '$amount' }, '$amount', { $toDouble: { $ifNull: ['$amount', 0] } }] },
          0
        ]
      }
    };

    // 1) Événements du mois
    const [evThis, evLast] = await Promise.all([
      this.model.countDocuments(thisMonthMatch as any),
      this.model.countDocuments(lastMonthMatch as any),
    ]);

    // 2) Serveurs actifs (distincts) du mois
    const [srvThis, srvLast] = await Promise.all([
      this.model.distinct('serveurs', thisMonthMatch as any),
      this.model.distinct('serveurs', lastMonthMatch as any),
    ]);
    const srvThisCount = (srvThis || []).filter(Boolean).length;
    const srvLastCount = (srvLast || []).filter(Boolean).length;

    // 3) Demandes en attente
    const [waitThis, waitLast] = await Promise.all([
      this.model.countDocuments({ ...thisMonthMatch, status: 'en_attente' } as any),
      this.model.countDocuments({ ...lastMonthMatch, status: 'en_attente' } as any),
    ]);

    // 4) Revenus (sum amount) pour événements confirmés
    const [revThisAgg, revLastAgg] = await Promise.all([
      this.model.aggregate([
        { $match: thisMonthMatch as any },
        { $match: { status: { $in: confirmedStatuses } } },
        { $group: { _id: null, total: { $sum: amountNumberExpr } } },
      ]),
      this.model.aggregate([
        { $match: lastMonthMatch as any },
        { $match: { status: { $in: confirmedStatuses } } },
        { $group: { _id: null, total: { $sum: amountNumberExpr } } },
      ]),
    ]);
    const revThis = revThisAgg[0]?.total ?? 0;
    const revLast = revLastAgg[0]?.total ?? 0;

    const round1 = (n: number) => Math.round(n * 10) / 10;

    return [
      { label: 'Événements du mois', value: evThis, difference: round1(pctChange(evThis, evLast)), inProgress: evThis >= evLast },
      { label: 'Serveurs actifs (mois)', value: srvThisCount, difference: round1(pctChange(srvThisCount, srvLastCount)), inProgress: srvThisCount >= srvLastCount },
      { label: 'Demandes en attente', value: waitThis, difference: round1(pctChange(waitThis, waitLast)), inProgress: waitThis <= waitLast ? false : true }, // à toi d'interpréter "progression"
      { label: 'Revenus du mois', value: revThis, difference: round1(pctChange(revThis, revLast)), inProgress: revThis >= revLast },
    ];
  }

  /** 4 événements récents (par createdAt) **/
  async recent() {
    return this.model.find().sort({ createdAt: -1 }).limit(4).populate('serveurs');
  }

  /** Répartition % par type **/
  async typesPercent() {
    const total = await this.model.estimatedDocumentCount();
    if (total === 0) {
      return Object.values(EventTypeEnum).map((t) => ({ label: t, count: 0, percent: 0 }));
    }
    const agg = await this.model.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return agg.map((x) => ({
      label: x._id as string,
      count: x.count,
      percent: Math.round((x.count / total) * 100),
    }));
  }

  /** Types evenement (key/value) **/
  typesKV() {
    return Object.entries(EventTypeEnum).map(([key, value]) => ({ key, value }));
  }

  /** Statuts d’événement (key/value) **/
  statusesKV() {
    return Object.entries(EventStatusEnum).map(([key, value]) => ({ key, value }));
  }
}
