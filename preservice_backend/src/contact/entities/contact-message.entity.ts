import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactMessageDocument = ContactMessage & Document & {
  createdAt: Date;
  updatedAt: Date;
};

export enum ContactMessageStatus {
  pending = 'pending',
  processed = 'processed',
}

@Schema({ timestamps: true })
export class ContactMessage {
  @ApiProperty({ example: 'Fatou Ndiaye' })
  @Prop({ required: true, trim: true })
  fullName: string;

  @ApiProperty({ example: 'fatou@example.com' })
  @Prop({ required: true, trim: true, lowercase: true, index: true })
  email: string;

  @ApiProperty({ example: '+221771234567', required: false })
  @Prop({ required: false, trim: true })
  phone?: string;

  @ApiProperty({ example: 'Demande de devis pour un mariage en juillet.' })
  @Prop({ required: true, trim: true })
  message: string;

  @ApiProperty({ enum: ContactMessageStatus, default: ContactMessageStatus.pending })
  @Prop({
    type: String,
    enum: Object.values(ContactMessageStatus),
    default: ContactMessageStatus.pending,
    index: true,
  })
  status: ContactMessageStatus;
}

export const ContactMessageSchema = SchemaFactory.createForClass(ContactMessage);

