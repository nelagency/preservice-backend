import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdminAuditLogDocument = AdminAuditLog & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class AdminAuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false, index: true })
  userId?: Types.ObjectId;

  @Prop({ required: false, trim: true, lowercase: true, index: true })
  email?: string;

  @Prop({ required: true, trim: true, index: true })
  event!: string;

  @Prop({ required: true, trim: true, index: true })
  status!: 'success' | 'failure' | 'pending';

  @Prop({ required: false, trim: true })
  role?: string;

  @Prop({ required: false, trim: true })
  ip?: string;

  @Prop({ required: false, trim: true })
  userAgent?: string;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, unknown>;

  createdAt?: Date;
}

export const AdminAuditLogSchema =
  SchemaFactory.createForClass(AdminAuditLog);

AdminAuditLogSchema.index({ event: 1, createdAt: -1 });
AdminAuditLogSchema.index({ email: 1, createdAt: -1 });
