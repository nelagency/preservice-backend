import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export type NotificationType =
    | 'EVENT_PUBLISHED'
    | 'PARTICIPATION_REQUESTED'
    | 'PARTICIPATION_APPROVED'
    | 'TIMESHEET_SUBMITTED' 
    | 'TIMESHEET_REVIEWED'
    | 'TIMESHEET_PAID';

export type RecipientModel = 'User' | 'Serveur';

@Schema({ timestamps: true })
export class Notification {
    @Prop({ type: Types.ObjectId, refPath: 'recipientModel', required: true, index: true })
    recipient!: Types.ObjectId;

    @Prop({ type: String, enum: ['User', 'Serveur'], required: true, index: true })
    recipientModel!: RecipientModel;

    @Prop({ type: String, required: true })
    type!: NotificationType;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    actor?: Types.ObjectId; // qui déclenche

    @Prop({ type: Object, default: {} })
    payload!: Record<string, any>; // { eventId, timesheetId, status, ... }

    @Prop({ type: String })
    title?: string;

    @Prop({ type: String })
    message?: string;

    @Prop({ type: Boolean, default: false, index: true })
    read!: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ recipient: 1, recipientModel: 1, createdAt: -1 });