import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OverviewDto } from './dto/overview.dto';
import { Event, EventDocument } from 'src/events/entities/event.entity';
import {
  Demande,
  DemandeDocument,
  DemandeStatusEnum,
} from 'src/demandes/entities/demande.entity';
import { Avi, AvisDocument } from 'src/avis/entities/avi.entity';
import {
  AssignmentStatus,
  Participation,
  ParticipationDocument,
} from 'src/participation/entities/participation.entity';

type ObjId = Types.ObjectId | string;

type WithTimestamps = { createdAt?: Date; updatedAt?: Date };
type DemandeLean = WithTimestamps & {
  _id: ObjId;
  status: DemandeStatusEnum;
  type?: string;
  client?: { _id?: ObjId; nom?: string; email?: string };
};

type EventLean = {
  _id: ObjId;
  title?: string;
  name?: string;
  startdate?: Date;
  date?: Date;
  guests?: number;
  status?: string;
  amount?: number;
  budget?: number;
  priceTotal?: number;
};

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Event.name) private events: Model<EventDocument>,
    @InjectModel(Demande.name) private demandes: Model<DemandeDocument>,
    @InjectModel(Participation.name)
    private parts: Model<ParticipationDocument>,
    @InjectModel(Avi.name) private avis: Model<AvisDocument>,
  ) {}

  private revenueExpr() {
    return {
      $ifNull: [
        '$amount',
        { $ifNull: ['$budget', { $ifNull: ['$priceTotal', 0] }] },
      ],
    };
  }

  private eventDateExpr() {
    return {
      $ifNull: ['$startdate', { $ifNull: ['$date', '$createdAt'] }],
    };
  }

  async overview(): Promise<OverviewDto> {
    const now = new Date();

    const [eventsTotal, requestWaiting, avgRatingDoc] = await Promise.all([
      this.events.countDocuments({
        $expr: { $gte: [this.eventDateExpr(), now] },
      }),
      this.demandes.countDocuments({ status: DemandeStatusEnum.en_attente }),
      this.avis.aggregate<{ avg: number }>([
        { $group: { _id: null, avg: { $avg: '$note' } } },
      ]),
    ]);

    const avgRating =
      Math.round(((avgRatingDoc[0]?.avg ?? 0) + Number.EPSILON) * 10) / 10;

    const activeAgg = await this.parts.aggregate<{ n: number }>([
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'ev',
        },
      },
      { $unwind: '$ev' },
      {
        $match: {
          assignmentStatus: {
            $in: [AssignmentStatus.provisional, AssignmentStatus.confirmed],
          },
          $expr: {
            $gte: [
              {
                $ifNull: [
                  '$ev.startdate',
                  { $ifNull: ['$ev.date', '$ev.createdAt'] },
                ],
              },
              now,
            ],
          },
        },
      },
      { $group: { _id: '$serveur' } },
      { $count: 'n' },
    ]);
    const serversActive = activeAgg[0]?.n ?? 0;

    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const monthEnd = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );

    const revenueAgg = await this.events.aggregate<{ sum: number }>([
      {
        $match: {
          $expr: {
            $and: [
              { $gte: [this.eventDateExpr(), monthStart] },
              { $lt: [this.eventDateExpr(), monthEnd] },
            ],
          },
        },
      },
      { $project: { r: this.revenueExpr() } },
      { $group: { _id: null, sum: { $sum: '$r' } } },
    ]);
    const revenue = Math.round((revenueAgg[0]?.sum ?? 0) * 100) / 100;

    const recentEv = await this.events
      .find()
      .sort({ createdAt: -1 })
      .limit(3)
      .lean<EventLean[]>();

    const recentEvents = (recentEv ?? []).map((eventItem, index) => ({
      id: String(eventItem._id),
      title: eventItem.title ?? eventItem.name ?? 'Evenement',
      date: (eventItem.startdate ?? eventItem.date ?? new Date()).toISOString(),
      guests: eventItem.guests ?? 0,
      status: eventItem.status ?? 'en_attente',
      amount: Number(
        eventItem.amount ?? eventItem.budget ?? eventItem.priceTotal ?? 0,
      ),
      tone: (['yellow', 'red', 'slate'] as const)[index % 3],
    }));

    const typeBreakdown = await this.events.aggregate<{
      label: string;
      value: number;
    }>([
      { $group: { _id: { $ifNull: ['$type', 'autre'] }, count: { $sum: 1 } } },
      { $project: { _id: 0, label: '$_id', value: '$count' } },
      { $sort: { value: -1 } },
    ]);

    const oneYearAgo = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1),
    );
    const revenuesMonthly = await this.events.aggregate<{
      month: string;
      value: number;
    }>([
      {
        $match: {
          $expr: {
            $and: [
              { $gte: [this.eventDateExpr(), oneYearAgo] },
              { $lt: [this.eventDateExpr(), monthEnd] },
            ],
          },
        },
      },
      {
        $project: {
          ym: {
            $dateToString: { format: '%Y-%m', date: this.eventDateExpr() },
          },
          r: this.revenueExpr(),
        },
      },
      { $group: { _id: '$ym', sum: { $sum: '$r' } } },
      { $project: { _id: 0, month: '$_id', value: '$sum' } },
      { $sort: { month: 1 } },
    ]);

    const lastDem = await this.demandes
      .find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('client', 'nom email')
      .lean<DemandeLean[]>();

    const recentActivity: OverviewDto['recentActivity'] = (lastDem ?? []).map(
      (demande) => {
        const type: 'new' | 'assign' | 'payment' | 'cancel' =
          demande.status === DemandeStatusEnum.confirme
            ? 'new'
            : demande.status === DemandeStatusEnum.rejete
              ? 'cancel'
              : 'new';

        const dot: 'green' | 'blue' | 'amber' =
          demande.status === DemandeStatusEnum.confirme
            ? 'green'
            : demande.status === DemandeStatusEnum.rejete
              ? 'amber'
              : 'blue';

        const title = demande.type ?? 'Demande';
        const user =
          demande.client?.nom ??
          demande.client?.email ??
          (demande.client?._id
            ? `#${String(demande.client._id).slice(-5)}`
            : 'Client');

        const time = new Date(
          demande.updatedAt ?? demande.createdAt ?? Date.now(),
        ).toLocaleString('fr-FR');

        return {
          id: String(demande._id),
          type,
          title,
          user,
          time,
          dot,
        };
      },
    );

    const perf: OverviewDto['performance'] = [
      {
        label: 'Taux de confirmation (demandes)',
        value: `${await this.ratioConfirmed()}%`,
        delta: '+2%',
      },
      {
        label: 'Candidatures/mission (moy.)',
        value: (await this.candidaturesParEvent()).toFixed(1),
        delta: '+0.3',
      },
      {
        label: 'Affectations confirmees',
        value: String(await this.affectationsConfirmees()),
        delta: '+1',
      },
    ];

    return {
      kpi: { eventsTotal, serversActive, requestWaiting, revenue, avgRating },
      recentEvents,
      typeBreakdown,
      revenuesMonthly,
      recentActivity,
      performance: perf,
    };
  }

  private async ratioConfirmed(): Promise<number> {
    const [total, confirmed] = await Promise.all([
      this.demandes.countDocuments(),
      this.demandes.countDocuments({ status: DemandeStatusEnum.confirme }),
    ]);
    if (!total) return 0;
    return Math.round((confirmed / total) * 100);
  }

  private async candidaturesParEvent(): Promise<number> {
    const agg = await this.parts.aggregate<{ avg: number }>([
      { $group: { _id: '$event', n: { $sum: 1 } } },
      { $group: { _id: null, avg: { $avg: '$n' } } },
    ]);
    return agg[0]?.avg ?? 0;
  }

  private async affectationsConfirmees(): Promise<number> {
    const count = await this.parts.countDocuments({
      assignmentStatus: AssignmentStatus.confirmed,
    });
    return count ?? 0;
  }
}
