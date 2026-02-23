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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const event_entity_1 = require("./entities/event.entity");
const notifications_service_1 = require("../notifications/notifications.service");
function startOfMonth(d = new Date()) {
    return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function startOfNextMonth(d = new Date()) {
    return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
}
function startOfLastMonth(d = new Date()) {
    return new Date(d.getFullYear(), d.getMonth() - 1, 1, 0, 0, 0, 0);
}
function pctChange(curr, prev) {
    if (prev === 0)
        return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
}
let EventsService = class EventsService {
    model;
    notif;
    constructor(model, notif) {
        this.model = model;
        this.notif = notif;
    }
    async create(dto) {
        const payload = { ...dto };
        if (dto.serveurs)
            payload.serveurs = dto.serveurs.map((s) => new mongoose_2.Types.ObjectId(s));
        if (dto.startdate)
            payload.date = new Date(dto.startdate);
        if (dto.enddate)
            payload.date = new Date(dto.enddate);
        const created = await this.model.create(payload);
        return created.toJSON();
    }
    async createEvent(dto, authorId, serveurIdsCiblés) {
        const payload = { ...dto };
        if (dto.serveurs)
            payload.serveurs = dto.serveurs.map((s) => new mongoose_2.Types.ObjectId(s));
        if (dto.startdate)
            payload.date = new Date(dto.startdate);
        if (dto.enddate)
            payload.date = new Date(dto.enddate);
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
    async findOne(id) {
        const doc = await this.model.findById(id).populate('serveurs');
        if (!doc)
            throw new common_1.NotFoundException('Event not found');
        return doc;
    }
    async update(id, dto) {
        const payload = { ...dto };
        if (dto.serveurs)
            payload.serveurs = dto.serveurs.map((s) => new mongoose_2.Types.ObjectId(s));
        if (dto.startdate)
            payload.date = new Date(dto.startdate);
        if (dto.enddate)
            payload.date = new Date(dto.enddate);
        const updated = await this.model.findByIdAndUpdate(id, payload, { new: true });
        if (!updated)
            throw new common_1.NotFoundException('Event not found');
        return updated;
    }
    async remove(id) {
        const deleted = await this.model.findByIdAndDelete(id);
        if (!deleted)
            throw new common_1.NotFoundException('Event not found');
        return { success: true };
    }
    async kpi() {
        const now = new Date();
        const thisStart = startOfMonth(now);
        const nextStart = startOfNextMonth(now);
        const lastStart = startOfLastMonth(now);
        const dateExpr = { $ifNull: ['$startdate', '$createdAt'] };
        const thisMonthMatch = {
            $expr: { $and: [{ $gte: [dateExpr, thisStart] }, { $lt: [dateExpr, nextStart] }] }
        };
        const lastMonthMatch = {
            $expr: { $and: [{ $gte: [dateExpr, lastStart] }, { $lt: [dateExpr, thisStart] }] }
        };
        const confirmedStatuses = ['confirme', 'confirmé', 'confirmed', 'CONFIRME', 'CONFIRMED'];
        const amountNumberExpr = {
            $toDouble: {
                $ifNull: [
                    { $cond: [{ $isNumber: '$amount' }, '$amount', { $toDouble: { $ifNull: ['$amount', 0] } }] },
                    0
                ]
            }
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
            this.model.aggregate([
                { $match: thisMonthMatch },
                { $match: { status: { $in: confirmedStatuses } } },
                { $group: { _id: null, total: { $sum: amountNumberExpr } } },
            ]),
            this.model.aggregate([
                { $match: lastMonthMatch },
                { $match: { status: { $in: confirmedStatuses } } },
                { $group: { _id: null, total: { $sum: amountNumberExpr } } },
            ]),
        ]);
        const revThis = revThisAgg[0]?.total ?? 0;
        const revLast = revLastAgg[0]?.total ?? 0;
        const round1 = (n) => Math.round(n * 10) / 10;
        return [
            { label: 'Événements du mois', value: evThis, difference: round1(pctChange(evThis, evLast)), inProgress: evThis >= evLast },
            { label: 'Serveurs actifs (mois)', value: srvThisCount, difference: round1(pctChange(srvThisCount, srvLastCount)), inProgress: srvThisCount >= srvLastCount },
            { label: 'Demandes en attente', value: waitThis, difference: round1(pctChange(waitThis, waitLast)), inProgress: waitThis <= waitLast ? false : true },
            { label: 'Revenus du mois', value: revThis, difference: round1(pctChange(revThis, revLast)), inProgress: revThis >= revLast },
        ];
    }
    async recent() {
        return this.model.find().sort({ createdAt: -1 }).limit(4).populate('serveurs');
    }
    async typesPercent() {
        const total = await this.model.estimatedDocumentCount();
        if (total === 0) {
            return Object.values(event_entity_1.EventTypeEnum).map((t) => ({ label: t, count: 0, percent: 0 }));
        }
        const agg = await this.model.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        return agg.map((x) => ({
            label: x._id,
            count: x.count,
            percent: Math.round((x.count / total) * 100),
        }));
    }
    typesKV() {
        return Object.entries(event_entity_1.EventTypeEnum).map(([key, value]) => ({ key, value }));
    }
    statusesKV() {
        return Object.entries(event_entity_1.EventStatusEnum).map(([key, value]) => ({ key, value }));
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(event_entity_1.Event.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        notifications_service_1.NotificationsService])
], EventsService);
//# sourceMappingURL=events.service.js.map