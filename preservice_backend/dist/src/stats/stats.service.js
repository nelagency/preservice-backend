"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const event_entity_1 = require("../events/entities/event.entity");
const demande_entity_1 = require("../demandes/entities/demande.entity");
const avi_entity_1 = require("../avis/entities/avi.entity");
const participation_entity_1 = require("../participation/entities/participation.entity");
let StatsService = class StatsService {
    events;
    demandes;
    parts;
    avis;
    constructor(events, demandes, parts, avis) {
        this.events = events;
        this.demandes = demandes;
        this.parts = parts;
        this.avis = avis;
    }
    revenueExpr() {
        return {
            $ifNull: [
                '$amount',
                { $ifNull: ['$budget', { $ifNull: ['$priceTotal', 0] }] },
            ],
        };
    }
    eventDateExpr() {
        return {
            $ifNull: ['$startdate', { $ifNull: ['$date', '$createdAt'] }],
        };
    }
    async overview() {
        const now = new Date();
        const [eventsTotal, requestWaiting, avgRatingDoc] = await Promise.all([
            this.events.countDocuments({
                $expr: { $gte: [this.eventDateExpr(), now] },
            }),
            this.demandes.countDocuments({ status: demande_entity_1.DemandeStatusEnum.en_attente }),
            this.avis.aggregate([
                { $group: { _id: null, avg: { $avg: '$note' } } },
            ]),
        ]);
        const avgRating = Math.round(((avgRatingDoc[0]?.avg ?? 0) + Number.EPSILON) * 10) / 10;
        const activeAgg = await this.parts.aggregate([
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
                        $in: [participation_entity_1.AssignmentStatus.provisional, participation_entity_1.AssignmentStatus.confirmed],
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
        const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
        const revenueAgg = await this.events.aggregate([
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
            .lean();
        const recentEvents = (recentEv ?? []).map((eventItem, index) => ({
            id: String(eventItem._id),
            title: eventItem.title ?? eventItem.name ?? 'Evenement',
            date: (eventItem.startdate ?? eventItem.date ?? new Date()).toISOString(),
            guests: eventItem.guests ?? 0,
            status: eventItem.status ?? 'en_attente',
            amount: Number(eventItem.amount ?? eventItem.budget ?? eventItem.priceTotal ?? 0),
            tone: ['yellow', 'red', 'slate'][index % 3],
        }));
        const typeBreakdown = await this.events.aggregate([
            { $group: { _id: { $ifNull: ['$type', 'autre'] }, count: { $sum: 1 } } },
            { $project: { _id: 0, label: '$_id', value: '$count' } },
            { $sort: { value: -1 } },
        ]);
        const oneYearAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
        const revenuesMonthly = await this.events.aggregate([
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
            .lean();
        const recentActivity = (lastDem ?? []).map((demande) => {
            const type = demande.status === demande_entity_1.DemandeStatusEnum.confirme
                ? 'new'
                : demande.status === demande_entity_1.DemandeStatusEnum.rejete
                    ? 'cancel'
                    : 'new';
            const dot = demande.status === demande_entity_1.DemandeStatusEnum.confirme
                ? 'green'
                : demande.status === demande_entity_1.DemandeStatusEnum.rejete
                    ? 'amber'
                    : 'blue';
            const title = demande.type ?? 'Demande';
            const user = demande.client?.nom ??
                demande.client?.email ??
                (demande.client?._id
                    ? `#${String(demande.client._id).slice(-5)}`
                    : 'Client');
            const time = new Date(demande.updatedAt ?? demande.createdAt ?? Date.now()).toLocaleString('fr-FR');
            return {
                id: String(demande._id),
                type,
                title,
                user,
                time,
                dot,
            };
        });
        const perf = [
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
    async ratioConfirmed() {
        const [total, confirmed] = await Promise.all([
            this.demandes.countDocuments(),
            this.demandes.countDocuments({ status: demande_entity_1.DemandeStatusEnum.confirme }),
        ]);
        if (!total)
            return 0;
        return Math.round((confirmed / total) * 100);
    }
    async candidaturesParEvent() {
        const agg = await this.parts.aggregate([
            { $group: { _id: '$event', n: { $sum: 1 } } },
            { $group: { _id: null, avg: { $avg: '$n' } } },
        ]);
        return agg[0]?.avg ?? 0;
    }
    async affectationsConfirmees() {
        const count = await this.parts.countDocuments({
            assignmentStatus: participation_entity_1.AssignmentStatus.confirmed,
        });
        return count ?? 0;
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(event_entity_1.Event.name)),
    __param(1, (0, mongoose_1.InjectModel)(demande_entity_1.Demande.name)),
    __param(2, (0, mongoose_1.InjectModel)(participation_entity_1.Participation.name)),
    __param(3, (0, mongoose_1.InjectModel)(avi_entity_1.Avi.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], StatsService);
//# sourceMappingURL=stats.service.js.map