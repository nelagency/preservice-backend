import { Document, Types } from 'mongoose';
export type NotificationDocument = Notification & Document;
export type NotificationType = 'EVENT_PUBLISHED' | 'PARTICIPATION_REQUESTED' | 'PARTICIPATION_APPROVED' | 'TIMESHEET_SUBMITTED' | 'TIMESHEET_REVIEWED' | 'TIMESHEET_PAID';
export type RecipientModel = 'User' | 'Serveur';
export declare class Notification {
    recipient: Types.ObjectId;
    recipientModel: RecipientModel;
    type: NotificationType;
    actor?: Types.ObjectId;
    payload: Record<string, any>;
    title?: string;
    message?: string;
    read: boolean;
}
export declare const NotificationSchema: import("mongoose").Schema<Notification, import("mongoose").Model<Notification, any, any, any, Document<unknown, any, Notification, any, {}> & Notification & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, Document<unknown, {}, import("mongoose").FlatRecord<Notification>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Notification> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
