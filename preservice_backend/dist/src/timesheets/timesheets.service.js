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
exports.TimesheetsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const timesheet_entity_1 = require("./entities/timesheet.entity");
const event_entity_1 = require("../events/entities/event.entity");
const participation_entity_1 = require("../participation/entities/participation.entity");
const serveur_entity_1 = require("../serveur/entities/serveur.entity");
const notifications_service_1 = require("../notifications/notifications.service");
let TimesheetsService = class TimesheetsService {
    tsModel;
    eventModel;
    serveurModel;
    partModel;
    notifications;
    constructor(tsModel, eventModel, serveurModel, partModel, notifications) {
        this.tsModel = tsModel;
        this.eventModel = eventModel;
        this.serveurModel = serveurModel;
        this.partModel = partModel;
        this.notifications = notifications;
    }
    computeWorkedMinutes(start, end, breakMin) {
        const diff = Math.max(0, Math.floor((+end - +start) / 60000));
        return Math.max(0, diff - (breakMin || 0));
    }
    async submitForEvent(eventId, serveurId, dto) {
        const event = await this.eventModel.findById(eventId);
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        const serveur = await this.serveurModel.findById(serveurId);
        if (!serveur)
            throw new common_1.NotFoundException('Serveur not found');
        const now = new Date();
        const eventDate = new Date(event.startdate ?? now);
        const isTermine = event.status === 'Terminé';
        if (!isTermine && eventDate > now)
            throw new common_1.ForbiddenException('Timesheet not allowed before event end');
        const approvedPart = await this.partModel.findOne({
            event: new mongoose_2.Types.ObjectId(eventId),
            candidatureStatus: 'approved',
            $or: [
                { serveur: new mongoose_2.Types.ObjectId(serveurId) },
                { 'serveur._id': new mongoose_2.Types.ObjectId(serveurId) },
            ],
        });
        if (!approvedPart)
            throw new common_1.ForbiddenException('Not an approved participant');
        const start = new Date(dto.startAt);
        const end = new Date(dto.endAt);
        if (!(start < end))
            throw new common_1.BadRequestException('endAt must be after startAt');
        const workedMinutes = this.computeWorkedMinutes(start, end, dto.breakMinutes);
        if (workedMinutes <= 0)
            throw new common_1.BadRequestException('worked minutes must be > 0');
        const doc = await this.tsModel.findOneAndUpdate({ event: event._id, serveur: new mongoose_2.Types.ObjectId(serveurId) }, {
            $set: {
                startAt: start, endAt: end,
                breakMinutes: dto.breakMinutes,
                workedMinutes, note: dto.note ?? null,
                status: 'submitted',
                validatedBy: null, validatedAt: null, validationComment: null,
            },
        }, { new: true, upsert: true, setDefaultsOnInsert: true });
        await this.notifications.pushToAdmins({
            type: 'TIMESHEET_SUBMITTED',
            payload: { eventId, timesheetId: doc.id.toString() },
            actorId: serveurId,
            title: 'Feuille d’heures soumise',
            message: 'Un serveur a soumis ses horaires',
        });
        return doc;
    }
    async getMineForEvent(eventId, serveurId) {
        const doc = await this.tsModel.findOne({ event: eventId, serveur: serveurId });
        if (!doc)
            throw new common_1.NotFoundException('No timesheet');
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
    async review(timesheetId, reviewerId, body) {
        const ts = await this.tsModel.findById(timesheetId);
        if (!ts)
            throw new common_1.NotFoundException('Timesheet not found');
        if (ts.status !== 'submitted')
            throw new common_1.BadRequestException('Timesheet already reviewed');
        ts.status = body.decision;
        ts.validationComment = body.comment ?? null;
        ts.validatedBy = new mongoose_2.Types.ObjectId(reviewerId);
        ts.validatedAt = new Date();
        await ts.save();
        const serveurIdStr = ts?.serveur?._id?.toString?.() ??
            ts?.serveur?.toString?.();
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
                actorId: reviewerId,
                actorModel: 'User',
                title: ts.status === 'approved' ? 'Feuille approuvée' : 'Feuille rejetée',
                message: ts.validationComment || undefined,
            });
        }
        return ts;
    }
    async listForEvent(eventId) {
        const list = this.tsModel.find({ event: eventId }).populate('serveur').sort({ createdAt: -1 }).lean();
        return list;
    }
    async listForServeur(serveurId) {
        const sid = mongoose_2.Types.ObjectId.isValid(serveurId) ? new mongoose_2.Types.ObjectId(serveurId) : serveurId;
        return this.tsModel
            .find({ serveur: sid })
            .populate('event')
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }
    async listForServeurSmart(userOrServeurId) {
        const id = mongoose_2.Types.ObjectId.isValid(userOrServeurId) ? new mongoose_2.Types.ObjectId(userOrServeurId) : userOrServeurId;
        let list = await this.tsModel.find({ serveur: id }).populate('event').sort({ createdAt: -1 }).lean().exec();
        if (list.length)
            return list;
        const srv = await this.serveurModel.findOne({ user: id }).lean().exec();
        if (!srv?._id)
            return [];
        return this.tsModel.find({ serveur: srv._id }).populate('event').sort({ createdAt: -1 }).lean().exec();
    }
    async pay(timesheetId, adminId, dto) {
        const ts = await this.tsModel.findById(timesheetId);
        if (!ts)
            throw new common_1.NotFoundException('Timesheet not found');
        if (ts.status !== 'approved') {
            throw new common_1.BadRequestException('Cannot pay a non-approved timesheet');
        }
        const amt = Number(dto.amount);
        if (!isFinite(amt) || amt <= 0) {
            throw new common_1.BadRequestException('Invalid amount');
        }
        ts.payments.push({
            amount: amt,
            note: dto.note,
            createdBy: new mongoose_2.Types.ObjectId(adminId),
            createdAt: new Date(),
        });
        ts.paidAmount = (ts.paidAmount || 0) + amt;
        if (dto.finalize) {
            ts.paymentStatus = 'paid';
            ts.paidAt = new Date();
            ts.paidBy = new mongoose_2.Types.ObjectId(adminId);
        }
        else {
            ts.paymentStatus = ts.paidAmount > 0 ? 'partial' : 'unpaid';
        }
        await ts.save();
        const serveurIdStr = ts?.serveur?._id?.toString?.() ??
            ts?.serveur?.toString?.();
        if (serveurIdStr) {
            await this.notifications.pushToServeurs({
                type: 'TIMESHEET_PAID',
                serveurIds: [serveurIdStr],
                payload: { timesheetId: ts.id.toString(), amount: amt, finalize: !!dto.finalize },
                actorId: adminId,
                actorModel: 'User',
                title: dto.finalize ? 'Paiement finalisé' : 'Paiement enregistré',
            });
        }
        return ts;
    }
};
exports.TimesheetsService = TimesheetsService;
exports.TimesheetsService = TimesheetsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(timesheet_entity_1.Timesheet.name)),
    __param(1, (0, mongoose_1.InjectModel)(event_entity_1.Event.name)),
    __param(2, (0, mongoose_1.InjectModel)(serveur_entity_1.Serveur.name)),
    __param(3, (0, mongoose_1.InjectModel)(participation_entity_1.Participation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationsService])
], TimesheetsService);
//# sourceMappingURL=timesheets.service.js.map