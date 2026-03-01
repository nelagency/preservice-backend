import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AboutContentDocument = AboutContent & Document & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ _id: false })
class AboutSection {
  @ApiProperty()
  @Prop({ required: true, trim: true })
  title: string;

  @ApiProperty()
  @Prop({ required: true, trim: true })
  content: string;
}

const AboutSectionSchema = SchemaFactory.createForClass(AboutSection);

@Schema({ timestamps: true })
export class AboutContent {
  @ApiProperty({ default: 'main' })
  @Prop({ required: true, unique: true, default: 'main', index: true })
  key: string;

  @ApiPropertyOptional()
  @Prop({ required: false, trim: true })
  vision?: string;

  @ApiPropertyOptional()
  @Prop({ required: false, trim: true })
  histoire?: string;

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  valeurs: string[];

  @ApiProperty({ type: [String], default: [] })
  @Prop({ type: [String], default: [] })
  founderImages: string[];

  @ApiProperty({ type: [Object], default: [] })
  @Prop({ type: [AboutSectionSchema], default: [] })
  sections: AboutSection[];
}

export const AboutContentSchema = SchemaFactory.createForClass(AboutContent);

