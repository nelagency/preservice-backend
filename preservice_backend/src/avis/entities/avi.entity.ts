import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type AvisDocument = Avi & Document;

@Schema({ timestamps: true })
export class Avi {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @Prop({ type: Number, required: true, min: 1, max: 5 })
  note: number;

  @ApiPropertyOptional()
  @Prop({ type: String, trim: true })
  commentaire?: string;

  @ApiProperty({ description: 'Client (User id)' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  client: Types.ObjectId;

  @ApiProperty({ description: 'Événement (Event id) associé' })
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true, index: true })
  event: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Affiché (true) ou masqué (false)',
    default: true,
  })
  @Prop({ type: Boolean, default: true })
  etat: boolean;
}

export const AvisSchema = SchemaFactory.createForClass(Avi);

// Option: un avis par (client, event)
//AvisSchema.index({ client: 1, event: 1 }, { unique: true });
