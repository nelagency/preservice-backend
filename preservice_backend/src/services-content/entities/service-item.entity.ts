import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ServiceItemDocument = ServiceItem & Document & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true })
export class ServiceItem {
  @ApiProperty({ example: 'Événements privés' })
  @Prop({ required: true, trim: true })
  title: string;

  @ApiProperty({ example: 'Organisation clé en main pour mariages, anniversaires, etc.' })
  @Prop({ required: true, trim: true })
  description: string;

  @ApiProperty({ example: 'evenements-prives' })
  @Prop({ required: true, trim: true, unique: true, index: true })
  slug: string;

  @ApiProperty({ example: '/media/services/prive.jpg', required: false })
  @Prop({ required: false, trim: true })
  imageUrl?: string;

  @ApiProperty({ example: true })
  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;
}

export const ServiceItemSchema = SchemaFactory.createForClass(ServiceItem);

