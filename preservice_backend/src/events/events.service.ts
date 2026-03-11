import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Event,
  EventDocument,
  EventStatusEnum,
  EventTypeEnum,
} from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { NotificationsService } from 'src/notifications/notifications.service';

function startOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function startOfNextMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
}
function startOfLastMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth() - 1, 1, 0, 0, 0, 0);
}
function pctChange(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}

type KpiAggregate = { total: number };
type TypesAggregate = { _id: string; count: number };

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private model: Model<EventDocument>,
    private readonly notif: NotificationsService,
  ) {}

  private toPersistPayload(
    dto: CreateEventDto | UpdateEventDto,
  ): Record<string, unknown> {
    const payload: Record<string, unknown> = { ...dto };

    if (dto.serveurs) {
      payload.serveurs = dto.serveurs.map((id) => new Types.ObjectId(id));
    }
    if (dto.startdate) {
      payload.startdate = new Date(dto.startdate);
    }
    if (dto.enddate) {
      payload.enddate = new Date(dto.enddate);
    }

    return payload;
  }

  async create(dto: CreateEventDto) {
    const payload = this.toPersistPayload(dto);
    const created = await this.model.create(payload);
    return created.toJSON();
  }

  async createEvent(
    dto: CreateEventDto,
    authorId: string,
    serveurIdsCibles: string[],
  ) {
    const payload = this.toPersistPayload(dto);
    const created = await this.model.create(payload);

    await this.notif.pushToServeurs({
      type: 'EVENT_PUBLISHED',
      serveurIds: serveurIdsCibles,
      payload: { eventId: String(created._id) },
      actorId: authorId,
      title: 'Nouvel evenement publie',
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
    const payload = this.toPersistPayload(dto);
    const updated = await this.model.findByIdAndUpdate(id, payload, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Event not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Event not found');
    return { success: true };
  }

  async kpi() {
    const now = new Date();
    const thisStart = startOfMonth(now);
    const nextStart = startOfNextMonth(now);
    const lastStart = startOfLastMonth(now);

    const dateExpr = { $ifNull: ['$startdate', '$createdAt'] };
    const thisMonthMatch = {
      $expr: {
        $and: [{ $gte: [dateExpr, thisStart] }, { $lt: [dateExpr, nextStart] }],
      },
    };
    const lastMonthMatch = {
      $expr: {
        $and: [{ $gte: [dateExpr, lastStart] }, { $lt: [dateExpr, thisStart] }],
      },
    };

    const confirmedStatuses = [
      'confirme',
      'confirme',
      'confirmed',
      'CONFIRME',
      'CONFIRMED',
    ];

    const amountNumberExpr = {
      $toDouble: {
        $ifNull: [
          {
            $cond: [
              { $isNumber: '$amount' },
              '$amount',
              { $toDouble: { $ifNull: ['$amount', 0] } },
            ],
          },
          0,
        ],
      },
    };

    const [evThis, evLast] = await Promise.all([
      this.model.countDocuments(thisMonthMatch),
      this.model.countDocuments(lastMonthMatch),
    ]);

    const [srvThis, srvLast] = await Promise.all([
      this.model.distinct('serveurs', thisMonthMatch),
      this.model.distinct('serveurs', lastMonthMatch),
    ]);
    const srvThisCount = (srvThis || []).filter(Boolean).length;
    const srvLastCount = (srvLast || []).filter(Boolean).length;

    const [waitThis, waitLast] = await Promise.all([
      this.model.countDocuments({ ...thisMonthMatch, status: 'en_attente' }),
      this.model.countDocuments({ ...lastMonthMatch, status: 'en_attente' }),
    ]);

    const [revThisAgg, revLastAgg] = await Promise.all([
      this.model.aggregate<KpiAggregate>([
        { $match: thisMonthMatch },
        { $match: { status: { $in: confirmedStatuses } } },
        { $group: { _id: null, total: { $sum: amountNumberExpr } } },
      ]),
      this.model.aggregate<KpiAggregate>([
        { $match: lastMonthMatch },
        { $match: { status: { $in: confirmedStatuses } } },
        { $group: { _id: null, total: { $sum: amountNumberExpr } } },
      ]),
    ]);
    const revThis = revThisAgg[0]?.total ?? 0;
    const revLast = revLastAgg[0]?.total ?? 0;

    const round1 = (n: number) => Math.round(n * 10) / 10;

    return [
      {
        label: 'Evenements du mois',
        value: evThis,
        difference: round1(pctChange(evThis, evLast)),
        inProgress: evThis >= evLast,
      },
      {
        label: 'Serveurs actifs (mois)',
        value: srvThisCount,
        difference: round1(pctChange(srvThisCount, srvLastCount)),
        inProgress: srvThisCount >= srvLastCount,
      },
      {
        label: 'Demandes en attente',
        value: waitThis,
        difference: round1(pctChange(waitThis, waitLast)),
        inProgress: waitThis > waitLast,
      },
      {
        label: 'Revenus du mois',
        value: revThis,
        difference: round1(pctChange(revThis, revLast)),
        inProgress: revThis >= revLast,
      },
    ];
  }

  async recent() {
    return this.model
      .find()
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('serveurs');
  }

  async typesPercent() {
    const total = await this.model.estimatedDocumentCount();
    if (total === 0) {
      return Object.values(EventTypeEnum).map((type) => ({
        label: type,
        count: 0,
        percent: 0,
      }));
    }

    const agg = await this.model.aggregate<TypesAggregate>([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return agg.map((item) => ({
      label: item._id,
      count: item.count,
      percent: Math.round((item.count / total) * 100),
    }));
  }

  typesKV() {
    return Object.entries(EventTypeEnum).map(([key, value]) => ({
      key,
      value,
    }));
  }

  statusesKV() {
    return Object.entries(EventStatusEnum).map(([key, value]) => ({
      key,
      value,
    }));
  }
}
