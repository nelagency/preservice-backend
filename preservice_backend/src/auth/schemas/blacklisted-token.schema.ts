import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BlacklistedTokenDocument = BlacklistedToken & Document;

@Schema({ timestamps: true })
export class BlacklistedToken {
    @Prop({ required: true, unique: true, index: true })
    tokenHash: string; // sha256 du JWT

    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    userId?: Types.ObjectId;

    @Prop({ required: true })
    expiresAt: Date; // = new Date(exp * 1000)
}
export const BlacklistedTokenSchema = SchemaFactory.createForClass(BlacklistedToken);

// TTL auto-suppression quand expiresAt est passé
BlacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });