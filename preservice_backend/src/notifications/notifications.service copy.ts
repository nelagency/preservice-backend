import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { Serveur, ServeurDocument } from 'src/serveur/entities/serveur.entity';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { Timesheet, TimesheetDocument } from 'src/timesheets/entities/timesheet.entity';
import { MailService } from 'src/mail/mail.service';
import { EventDocument } from 'src/events/entities/event.entity';

type PushArgs = {
    type: NotificationType;
    userIds: string[];              // Attention: accepte des User._id ... OU des Serveur._id (on résout)
    payload?: Record<string, any>;
    actorId?: string;
    title?: string;
    message?: string;
};

@Injectable()
export class NotificationsService {
    private readonly log = new Logger(NotificationsService.name);

    constructor(
        @InjectModel(Notification.name) private model: Model<NotificationDocument>,
        @InjectModel(Serveur.name) private serveurModel: Model<ServeurDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Event.name) private eventModel: Model<EventDocument>,
        @InjectModel(Timesheet.name) private tsModel: Model<TimesheetDocument>,
        private readonly mail: MailService,
        private gw: NotificationsGateway,
    ) { }

    async pushToUsers(params: {
        type: NotificationType;
        userIds: string[];
        payload?: Record<string, any>;
        actorId?: string;
        title?: string;
        message?: string;
    }) { 
        const { type, userIds, payload = {}, actorId, title, message } = params;
        if (!userIds?.length) return [];

        const docs = userIds.map(uid => ({
            user: new Types.ObjectId(uid),
            type,
            payload,
            actor: actorId ? new Types.ObjectId(actorId) : undefined,
            title,
            message,
            read: false,
        }));
        const inserted = await this.model.insertMany(docs, { ordered: false }).catch(() => []);
        // WS broadcast
        this.gw.broadcast(userIds, { type, payload, title, message, ts: Date.now() });
        return inserted;
    }

    async listMine(userId: string, limit = 50, before?: string) {
        const q: any = { user: new Types.ObjectId(userId) };
        if (before) q.createdAt = { $lt: new Date(before) };
        return this.model.find(q).sort({ createdAt: -1 }).limit(limit).lean();
    }

    async unreadCount(userId: string) {
        return this.model.countDocuments({ user: userId, read: false });
    }

    async markRead(userId: string, id: string) {
        await this.model.updateOne({ _id: id, user: userId }, { $set: { read: true } });
    }

    async markAllRead(userId: string) {
        await this.model.updateMany({ user: userId, read: false }, { $set: { read: true } });
    }
}