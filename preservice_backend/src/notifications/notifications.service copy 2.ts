import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType, RecipientModel } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { Serveur, ServeurDocument } from 'src/serveur/entities/serveur.entity';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { Timesheet, TimesheetDocument } from 'src/timesheets/entities/timesheet.entity';
import { MailService } from 'src/mail/mail.service';
import { EventDocument } from 'src/events/entities/event.entity';
import { EmailService } from 'src/email/email.service';

type PushBase = {
    type: NotificationType;
    payload?: Record<string, any>;
    actorId?: string;
    actorModel?: RecipientModel; // 'User' ou 'Serveur' (défaut: 'User')
    title?: string;
    message?: string;
};

@Injectable()
export class NotificationsService {
    private readonly log = new Logger(NotificationsService.name);

    constructor(
        @InjectModel(Notification.name) private notifModel: Model<NotificationDocument>,
        @InjectModel(Serveur.name) private serveurModel: Model<ServeurDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Event.name) private eventModel: Model<EventDocument>,
        @InjectModel(Timesheet.name) private tsModel: Model<TimesheetDocument>,
        private readonly mail: EmailService,
        private gw: NotificationsGateway,
    ) { }

    /** Notifier une liste d’admins (User._id) */
    async pushToUsers(args: PushBase & { userIds: string[] }) {
        const ids = (args.userIds || []).filter((x) => Types.ObjectId.isValid(x));
        if (!ids.length) return { created: 0 };

        const users = await this.userModel.find({ _id: { $in: ids } }).select('_id email').lean();
        if (!users.length) return { created: 0 };

        const docs = await this.notifModel.insertMany(
            users.map((u) => ({
                recipient: u._id,
                recipientModel: 'User',
                type: args.type,
                payload: args.payload ?? {},
                actor: args.actorId && Types.ObjectId.isValid(args.actorId) ? new Types.ObjectId(args.actorId) : undefined,
                actorModel: args.actorModel ?? 'User',
                title: args.title,
                message: args.message,
                read: false,
            })),
        );

        try {
            const userIds = users.map(u => u._id.toString());
            this.gw?.emitToUsers(userIds, {
                type: args.type,
                title: args.title,
                message: args.message,
                payload: args.payload ?? {},
                ts: Date.now(),
            });
        } catch { }

        const emailJobs = users
            .filter((u) => !!u.email)
            .map((u) =>
                this.sendEmailFor(args.type, u.email!, args.payload, 'User').catch((e) =>
                    this.log.warn(`email fail (${args.type}) -> ${u.email}: ${e?.message || e}`),
                ),
            );
        await Promise.allSettled(emailJobs);
        return { created: docs.length };
    }

    /** Notifier tous les admins/superadmins automatiquement */
    async pushToAdmins(args: PushBase) {
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

    /** Notifier des serveurs (Serveur._id) */
    async pushToServeurs(args: PushBase & { serveurIds: string[] }) {
        const ids = (args.serveurIds || []).filter((x) => Types.ObjectId.isValid(x));
        if (!ids.length) return { created: 0 };

        const serveurs = await this.serveurModel
            .find({ _id: { $in: ids } })
            .select('_id email nom prenom')
            .lean();
        if (!serveurs.length) return { created: 0 };

        const docs = await this.notifModel.insertMany(
            serveurs.map((s) => ({
                recipient: s._id,
                recipientModel: 'Serveur',
                type: args.type,
                payload: args.payload ?? {},
                actor: args.actorId && Types.ObjectId.isValid(args.actorId) ? new Types.ObjectId(args.actorId) : undefined,
                actorModel: args.actorModel ?? 'User',
                title: args.title,
                message: args.message,
                read: false,
            })),
        );

        try {
            const serveurIds = serveurs.map(s => s._id.toString());
            this.gw?.emitToServeurs(serveurIds, {
                type: args.type,
                title: args.title,
                message: args.message,
                payload: args.payload ?? {},
                ts: Date.now(),
            });
        } catch { }


        // Emails best-effort
        const emailJobs = serveurs
            .filter((s) => !!s.email)
            .map((s) =>
                this.sendEmailFor(args.type, s.email!, args.payload, 'Serveur', s).catch((e) =>
                    this.log.warn(`email fail (${args.type}) -> ${s.email}: ${e?.message || e}`),
                ),
            );
        await Promise.allSettled(emailJobs);
        return { created: docs.length };
    }

    // ----------- Email routing -----------
    private async resolveContext(payload?: any) {
        const eventId = payload?.eventId || payload?.event;
        const serveurId = payload?.serveurId || payload?.serveur;
        const timesheetId = payload?.timesheetId;

        const [event, serveur, ts] = await Promise.all([
            eventId && Types.ObjectId.isValid(eventId) ? this.eventModel.findById(eventId).lean() : null,
            serveurId && Types.ObjectId.isValid(serveurId) ? this.serveurModel.findById(serveurId).lean() : null,
            timesheetId && Types.ObjectId.isValid(timesheetId) ? this.tsModel.findById(timesheetId).lean() : null,
        ]);

        return { event, serveur, ts };
    }

    private async sendEmailFor(
        type: NotificationType,
        to: string,
        payload?: any,
        recipientModel?: 'User' | 'Serveur',
        serveurDoc?: { nom?: string; prenom?: string; email?: string }
    ) {
        if (process.env.MAIL_ENABLED === 'false') return;
        const { event, serveur, ts } = await this.resolveContext(payload);

        switch (type) {
            case 'EVENT_PUBLISHED':
                if (event) return this.mail.eventPublishedToServeur(to, event as any);
                return this.mail.generic(to, 'Nouvel événement publié', {
                    intro: 'Un nouvel évènement vient d’être publié.',
                    ctaLabel: 'Voir mes événements',
                    ctaHref: `${process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001'}/serveur`,
                });

            case 'PARTICIPATION_REQUESTED':
                return this.mail.participationRequestedAdmin(to, event as any);

            case 'PARTICIPATION_APPROVED':
                return this.mail.generic(to, 'Participation approuvée', {
                    intro: 'Votre participation a été approuvée.',
                    ctaLabel: 'Voir mes missions',
                    ctaHref: `${process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001'}/serveur`,
                });

            case 'TIMESHEET_SUBMITTED':
                return this.mail.timesheetSubmittedAdmin(to, event as any);

            case 'TIMESHEET_REVIEWED':
                return this.mail.timesheetReviewedServeur(to, payload?.status, payload?.comment);

            case 'TIMESHEET_PAID':
                return this.mail.timesheetPaidServeur(to, Number(payload?.amount || 0), !!payload?.finalize);

            default:
                return this.mail.generic(to, 'Notification', { intro: 'Vous avez une nouvelle notification.' });
        }
    }

    async listMine(userId: string, limit = 50, before?: string) {
        const q: any = { user: new Types.ObjectId(userId) };
        if (before) q.createdAt = { $lt: new Date(before) };
        return this.notifModel.find(q).sort({ createdAt: -1 }).limit(limit).lean();
    }

    async unreadCount(userId: string) {
        return this.notifModel.countDocuments({ user: userId, read: false });
    }

    async markRead(userId: string, id: string) {
        await this.notifModel.updateOne({ _id: id, user: userId }, { $set: { read: true } });
    }

    async markAllRead(userId: string) {
        await this.notifModel.updateMany({ user: userId, read: false }, { $set: { read: true } });
    }
}