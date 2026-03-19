import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';

export type UserDocument = User & Document;

export enum UserRole {
  user = 'user',
  admin = 'admin',
  superadmin = 'superadmin',
}

@Schema({ timestamps: true })
export class User {
  @ApiProperty() @Prop({ required: true, trim: true }) nom: string;

  @ApiProperty()
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @ApiProperty() @Prop({ required: true, trim: true }) numero_tel: string;

  @ApiPropertyOptional() @Prop({ trim: true }) adresse?: string;

  // hash stocké, pas en clair
  @Prop({ required: true, select: false }) mot_passe: string;

  @ApiPropertyOptional({ default: true })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ enum: UserRole, default: UserRole.user })
  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.user,
    index: true,
  })
  role: UserRole;

  @ApiPropertyOptional({ default: false })
  @Prop({ type: Boolean, default: false })
  twoFactorEnabled: boolean;

  @Prop({ type: String, select: false })
  twoFactorSecret?: string;

  @Prop({ type: String, select: false })
  twoFactorTempSecret?: string;

  @Prop({ type: Date })
  twoFactorEnabledAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  const doc = this as any;
  if (doc.isModified('mot_passe')) {
    const salt = await bcrypt.genSalt(10);
    doc.mot_passe = await bcrypt.hash(doc.mot_passe, salt);
  }
  next();
});
