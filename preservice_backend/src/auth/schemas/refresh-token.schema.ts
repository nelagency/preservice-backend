import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ timestamps: true })
export class RefreshToken {
    @Prop({ required: true, unique: true, index: true })
    tokenHash: string;                       // sha256(token)

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    expiresAt: Date;                         // = exp * 1000

    @Prop() revokedAt?: Date;                // rotation/logout
    @Prop() replacedByHash?: string;         // chaîne de rotation (optionnel)

    @Prop() userAgent?: string;
    @Prop() ip?: string;

    @Prop({ type: String, enum: ['user', 'serveur'], default: 'user', index: true })
    accountType: 'user' | 'serveur';
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

// Purge auto quand expiresAt est passé
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// (optionnel mais utile pour requêtes)
RefreshTokenSchema.index({ userId: 1, accountType: 1 });