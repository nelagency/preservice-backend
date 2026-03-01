import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InstagramPostDocument = InstagramPost & Document;

@Schema({ timestamps: true })
export class InstagramPost {
  @ApiProperty({ description: 'Image URL du post Instagram' })
  @Prop({ required: true, trim: true })
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Texte/description du post' })
  @Prop({ trim: true, default: '' })
  caption?: string;

  @ApiPropertyOptional({ description: 'Lien public vers le post Instagram' })
  @Prop({ trim: true, default: '' })
  postUrl?: string;

  @ApiPropertyOptional({ description: 'Date de publication du post' })
  @Prop()
  postedAt?: Date;

  @ApiPropertyOptional({ default: true })
  @Prop({ default: true, index: true })
  isActive?: boolean;
}

export const InstagramPostSchema = SchemaFactory.createForClass(InstagramPost);
