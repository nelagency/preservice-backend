// src/stats/stats.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OverviewDto } from './dto/overview.dto';
import { Event, EventDocument } from 'src/events/entities/event.entity';
import { Demande, DemandeDocument, DemandeStatusEnum } from 'src/demandes/entities/demande.entity';
import { Avi, AvisDocument } from 'src/avis/entities/avi.entity';
import { AssignmentStatus, Participation, ParticipationDocument } from 'src/participation/entities/participation.entity';

type WithTimestamps = { createdAt?: Date; updatedAt?: Date };
type DemandeLean = WithTimestamps & {
    _id: any;
    status: DemandeStatusEnum;
    type?: string;
    client?: { _id?: any; nom?: string; email?: string };
};

@Injectable()
export class StatsService {
    constructor(
        @InjectModel(Event.name) private events: Model<EventDocument>,
        @InjectModel(Demande.name) private demandes: Model<DemandeDocument>,
        @InjectModel(Participation.name) private parts: Model<ParticipationDocument>,
        @InjectModel(Avi.name) private avis: Model<AvisDocument>,
    ) { }

    private revenueExpr() {
        // essaie plusieurs noms de champs possibles
        return {
            $ifNull: [
                '$amount',
                { $ifNull: ['$budget', { $ifNull: ['$priceTotal', 0] }] }
            ],
        };
    }

    async overview(): Promise<OverviewDto> {
        const now = new Date();

        // 1) KPIs
        const [eventsTotal, requestWaiting, avgRatingDoc] = await Promise.all([
            this.events.countDocuments({ date: { $gte: now } }),
            this.demandes.countDocuments({ status: DemandeStatusEnum.en_attente }),
            this.avis.aggregate([{ $group: { _id: null, avg: { $avg: '$note' } } }]),
        ]);

        const avgRating = Math.round(((avgRatingDoc?.[0]?.avg ?? 0) + Number.EPSILON) * 10) / 10;

        // serversActive = nb serveurs distincts avec assignmentStatus provis./confirm. sur évènements à venir
        const activeAgg = await this.parts.aggregate([
            { $lookup: { from: 'events', localField: 'event', foreignField: '_id', as: 'ev' } },
            { $unwind: '$ev' },
            { $match: { 'ev.date': { $gte: now }, assignmentStatus: { $in: [AssignmentStatus.provisional, AssignmentStatus.confirmed] } } },
            { $group: { _id: '$serveur' } },
            { $count: 'n' },
        ]);
        const serversActive = activeAgg?.[0]?.n ?? 0;

        // revenue (mois courant) = somme des montants des events du mois en cours (si champ existe)
        const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
        const revenueAgg = await this.events.aggregate([
            { $match: { date: { $gte: monthStart, $lt: monthEnd } } },
            { $project: { r: this.revenueExpr() } },
            { $group: { _id: null, sum: { $sum: '$r' } } },
        ]);
        const revenue = Math.round((revenueAgg?.[0]?.sum ?? 0) * 100) / 100;

        // 2) Événements récents (3 plus proches à venir)
        const recentEv = await this.events
            .find({ date: { $gte: now } })
            .sort({ date: 1 })
            .limit(3)
            .lean();

        const recentEvents = (recentEv ?? []).map((e, i) => ({
            id: String(e._id),
            title: (e as any).title ?? (e as any).name ?? 'Évènement',
            date: (e as any).date?.toISOString?.() ?? new Date().toISOString(),
            guests: (e as any).guests ?? 0,
            status: (e as any).status ?? 'en_attente',
            amount: Number((e as any).amount ?? (e as any).budget ?? (e as any).priceTotal ?? 0),
            tone: (['yellow', 'red', 'slate'] as const)[i % 3],
        }));

        // 3) Répartition par type
        const typeAgg = await this.events.aggregate([
            { $group: { _id: { $ifNull: ['$type', 'autre'] }, count: { $sum: 1 } } },
            { $project: { _id: 0, label: '$_id', value: '$count' } },
            { $sort: { value: -1 } },
        ]);
        const typeBreakdown = typeAgg as Array<{ label: string; value: number }>;

        // 4) Revenus mensuels (12 derniers mois)
        const oneYearAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
        const revMonthly = await this.events.aggregate([
            { $match: { date: { $gte: oneYearAgo, $lt: monthEnd } } },
            {
                $project: {
                    ym: {
                        $dateToString: { format: '%Y-%m', date: '$date' }
                    },
                    r: this.revenueExpr(),
                }
            },
            { $group: { _id: '$ym', sum: { $sum: '$r' } } },
            { $project: { _id: 0, month: '$_id', value: '$sum' } },
            { $sort: { month: 1 } },
        ]);
        const revenuesMonthly = revMonthly as Array<{ month: string; value: number }>;

        // 5) Activité récente (simple : dernières demandes)
        const lastDem: DemandeLean[] = await this.demandes
            .find()
            .sort({ updatedAt: -1 })
            .limit(5)
            .populate('client', 'nom email')
            .lean();
        const src: DemandeLean[] = Array.isArray(lastDem) ? lastDem : [];
        const recentActivity : OverviewDto['recentActivity'] = src.map(d => {
            const type: 'new' | 'assign' | 'payment' | 'cancel' =
                d.status === DemandeStatusEnum.confirme ? 'new'
                    : d.status === DemandeStatusEnum.rejete ? 'cancel'
                        : 'new';

            const dot: 'green' | 'blue' | 'amber' =
                d.status === DemandeStatusEnum.confirme ? 'green'
                    : d.status === DemandeStatusEnum.rejete ? 'amber'
                        : 'blue';

            const title: string = d.type ?? 'Demande';

            const user: string =
                d.client?.nom
                ?? d.client?.email
                ?? (d.client?._id ? `#${String(d.client._id).slice(-5)}` : 'Client');

            const time: string = new Date(d.updatedAt ?? d.createdAt ?? Date.now())
                .toLocaleString('fr-FR');

            return {
                id: String(d._id),
                type,
                title,
                user,
                time,
                dot,
            };
        });

        // 6) Performance (exemples basés sur agrégats)
        const perf: OverviewDto['performance'] = [
            { label: 'Taux de confirmation (demandes)', value: `${await this.ratioConfirmed()}%`, delta: '+2%' },
            { label: 'Candidatures/mission (moy.)', value: (await this.candidaturesParEvent()).toFixed(1), delta: '+0.3' },
            { label: 'Affectations confirmées', value: String(await this.affectationsConfirmees()), delta: '+1' },
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

    private async ratioConfirmed() {
        const [tot, conf] = await Promise.all([
            this.demandes.countDocuments(),
            this.demandes.countDocuments({ status: DemandeStatusEnum.confirme }),
        ]);
        if (!tot) return 0;
        return Math.round((conf / tot) * 100);
    }

    private async candidaturesParEvent() {
        const agg = await this.parts.aggregate([
            { $group: { _id: '$event', n: { $sum: 1 } } },
            { $group: { _id: null, avg: { $avg: '$n' } } },
        ]);
        return agg?.[0]?.avg ?? 0;
    }

    private async affectationsConfirmees() {
        const n = await this.parts.countDocuments({ assignmentStatus: AssignmentStatus.confirmed });
        return n ?? 0;
    }
}