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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_entity_1 = require("./entities/notification.entity");
const notifications_gateway_1 = require("./notifications.gateway");
const serveur_entity_1 = require("../serveur/entities/serveur.entity");
const user_entity_1 = require("../users/entities/user.entity");
const timesheet_entity_1 = require("../timesheets/entities/timesheet.entity");
const event_entity_1 = require("../events/entities/event.entity");
const email_service_1 = require("../email/email.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    notifModel;
    serveurModel;
    userModel;
    eventModel;
    tsModel;
    mail;
    gw;
    log = new common_1.Logger(NotificationsService_1.name);
    constructor(notifModel, serveurModel, userModel, eventModel, tsModel, mail, gw) {
        this.notifModel = notifModel;
        this.serveurModel = serveurModel;
        this.userModel = userModel;
        this.eventModel = eventModel;
        this.tsModel = tsModel;
        this.mail = mail;
        this.gw = gw;
    }
    async pushToUsers(args) {
        const ids = (args.userIds || []).filter((x) => mongoose_2.Types.ObjectId.isValid(x));
        if (!ids.length)
            return { created: 0 };
        const users = await this.userModel.find({ _id: { $in: ids } }).select('_id email').lean();
        if (!users.length)
            return { created: 0 };
        const docs = await this.notifModel.insertMany(users.map((u) => ({
            recipient: u._id,
            recipientModel: 'User',
            type: args.type,
            payload: args.payload ?? {},
            actor: args.actorId && mongoose_2.Types.ObjectId.isValid(args.actorId) ? new mongoose_2.Types.ObjectId(args.actorId) : undefined,
            actorModel: args.actorModel ?? 'User',
            title: args.title,
            message: args.message,
            read: false,
        })));
        try {
            const userIds = users.map(u => u._id.toString());
            this.gw?.emitToUsers(userIds, {
                type: args.type,
                title: args.title,
                message: args.message,
                payload: args.payload ?? {},
                ts: Date.now(),
            });
        }
        catch { }
        const emailJobs = users
            .filter((u) => !!u.email)
            .map((u) => this.sendEmailFor(args.type, u.email, args.payload, 'User').catch((e) => this.log.warn(`email fail (${args.type}) -> ${u.email}: ${e?.message || e}`)));
        await Promise.allSettled(emailJobs);
        return { created: docs.length };
    }
    async pushToAdmins(args) {
        const admins = await this.userModel
            .find({ role: { $in: ['admin', 'superadmin'] } })
            .select('_id email')
            .lean();
        if (!admins.length) {
            this.log.warn('[pushToAdmins] Aucun admin/superadmin trouvé');
            return { created: 0 };
        }
        return this.pushToUsers({ ...args, userIds: admins.map((a) => a._id.toString()) });
    }
    async pushToServeurs(args) {
        const ids = (args.serveurIds || []).filter((x) => mongoose_2.Types.ObjectId.isValid(x));
        if (!ids.length)
            return { created: 0 };
        const serveurs = await this.serveurModel
            .find({ _id: { $in: ids } })
            .select('_id email nom prenom')
            .lean();
        if (!serveurs.length)
            return { created: 0 };
        const docs = await this.notifModel.insertMany(serveurs.map((s) => ({
            recipient: s._id,
            recipientModel: 'Serveur',
            type: args.type,
            payload: args.payload ?? {},
            actor: args.actorId && mongoose_2.Types.ObjectId.isValid(args.actorId) ? new mongoose_2.Types.ObjectId(args.actorId) : undefined,
            actorModel: args.actorModel ?? 'User',
            title: args.title,
            message: args.message,
            read: false,
        })));
        try {
            const serveurIds = serveurs.map(s => s._id.toString());
            this.gw?.emitToServeurs(serveurIds, {
                type: args.type,
                title: args.title,
                message: args.message,
                payload: args.payload ?? {},
                ts: Date.now(),
            });
        }
        catch { }
        const emailJobs = serveurs
            .filter((s) => !!s.email)
            .map((s) => this.sendEmailFor(args.type, s.email, args.payload, 'Serveur', s).catch((e) => this.log.warn(`email fail (${args.type}) -> ${s.email}: ${e?.message || e}`)));
        await Promise.allSettled(emailJobs);
        return { created: docs.length };
    }
    async resolveContext(payload) {
        const eventId = payload?.eventId || payload?.event;
        const serveurId = payload?.serveurId || payload?.serveur;
        const timesheetId = payload?.timesheetId;
        const [event, serveur, ts] = await Promise.all([
            eventId && mongoose_2.Types.ObjectId.isValid(eventId) ? this.eventModel.findById(eventId).lean() : null,
            serveurId && mongoose_2.Types.ObjectId.isValid(serveurId) ? this.serveurModel.findById(serveurId).lean() : null,
            timesheetId && mongoose_2.Types.ObjectId.isValid(timesheetId) ? this.tsModel.findById(timesheetId).lean() : null,
        ]);
        return { event, serveur, ts };
    }
    async sendEmailFor(type, to, payload, recipientModel, serveurDoc) {
        if (process.env.MAIL_ENABLED === 'false')
            return;
        const { event, serveur, ts } = await this.resolveContext(payload);
        switch (type) {
            case 'EVENT_PUBLISHED':
                if (event)
                    return this.mail.eventPublishedToServeur(to, event);
                return this.mail.generic(to, 'Nouvel événement publié', {
                    intro: 'Un nouvel évènement vient d’être publié.',
                    ctaLabel: 'Voir mes événements',
                    ctaHref: `${process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001'}/serveur`,
                });
            case 'PARTICIPATION_REQUESTED':
                return this.mail.participationRequestedAdmin(to, event);
            case 'PARTICIPATION_APPROVED':
                return this.mail.generic(to, 'Participation approuvée', {
                    intro: 'Votre participation a été approuvée.',
                    ctaLabel: 'Voir mes missions',
                    ctaHref: `${process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001'}/serveur`,
                });
            case 'TIMESHEET_SUBMITTED':
                return this.mail.timesheetSubmittedAdmin(to, event);
            case 'TIMESHEET_REVIEWED':
                return this.mail.timesheetReviewedServeur(to, payload?.status, payload?.comment);
            case 'TIMESHEET_PAID':
                return this.mail.timesheetPaidServeur(to, Number(payload?.amount || 0), !!payload?.finalize);
            default:
                return this.mail.generic(to, 'Notification', { intro: 'Vous avez une nouvelle notification.' });
        }
    }
    async listMine(recipientId, model, limit = 50, before) {
        const q = { recipient: new mongoose_2.Types.ObjectId(recipientId), recipientModel: model };
        if (before)
            q.createdAt = { $lt: new Date(before) };
        return this.notifModel.find(q).sort({ createdAt: -1 }).limit(limit).lean();
    }
    async unreadCount(recipientId, model) {
        return this.notifModel.countDocuments({ recipient: recipientId, recipientModel: model, read: false });
    }
    async markRead(recipientId, model, id) {
        await this.notifModel.updateOne({ _id: id, recipient: recipientId, recipientModel: model }, { $set: { read: true } });
    }
    async markAllRead(recipientId, model) {
        await this.notifModel.updateMany({ recipient: recipientId, recipientModel: model, read: false }, { $set: { read: true } });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_entity_1.Notification.name)),
    __param(1, (0, mongoose_1.InjectModel)(serveur_entity_1.Serveur.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __param(3, (0, mongoose_1.InjectModel)(event_entity_1.Event.name)),
    __param(4, (0, mongoose_1.InjectModel)(timesheet_entity_1.Timesheet.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        email_service_1.EmailService,
        notifications_gateway_1.NotificationsGateway])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map