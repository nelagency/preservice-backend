import { Model } from 'mongoose';
import { NotificationDocument, NotificationType, RecipientModel } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { ServeurDocument } from 'src/serveur/entities/serveur.entity';
import { UserDocument } from 'src/users/entities/user.entity';
import { TimesheetDocument } from 'src/timesheets/entities/timesheet.entity';
import { EventDocument } from 'src/events/entities/event.entity';
import { EmailService } from 'src/email/email.service';
type PushBase = {
    type: NotificationType;
    payload?: Record<string, any>;
    actorId?: string;
    actorModel?: RecipientModel;
    title?: string;
    message?: string;
};
export declare class NotificationsService {
    private notifModel;
    private serveurModel;
    private userModel;
    private eventModel;
    private tsModel;
    private readonly mail;
    private gw;
    private readonly log;
    constructor(notifModel: Model<NotificationDocument>, serveurModel: Model<ServeurDocument>, userModel: Model<UserDocument>, eventModel: Model<EventDocument>, tsModel: Model<TimesheetDocument>, mail: EmailService, gw: NotificationsGateway);
    pushToUsers(args: PushBase & {
        userIds: string[];
    }): Promise<{
        created: number;
    }>;
    pushToAdmins(args: PushBase): Promise<{
        created: number;
    }>;
    pushToServeurs(args: PushBase & {
        serveurIds: string[];
    }): Promise<{
        created: number;
    }>;
    private resolveContext;
    private sendEmailFor;
    listMine(recipientId: string, model: RecipientModel, limit?: number, before?: string): Promise<(import("mongoose").FlattenMaps<NotificationDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    unreadCount(recipientId: string, model: RecipientModel): Promise<number>;
    markRead(recipientId: string, model: RecipientModel, id: string): Promise<void>;
    markAllRead(recipientId: string, model: RecipientModel): Promise<void>;
}
export {};
