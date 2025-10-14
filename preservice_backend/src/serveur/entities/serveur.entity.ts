import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type ServeurDocument = Serveur & Document;

export enum ServeurStatus {
    disponible = 'Disponible',
    occupe = 'Occupé',
}

@Schema({ timestamps: true })
export class Serveur {
    @ApiProperty() @Prop({ required: true, trim: true }) nom: string;
    @ApiProperty() @Prop({ required: true, trim: true }) prenom: string;
    @ApiProperty() @Prop({ required: true, trim: true }) phone: string;

    @ApiProperty() @Prop({ required: true, unique: true, lowercase: true, index: true }) email: string;
    @Prop({ required: true, select: false }) mot_passe: string; // hash bcrypt

    @ApiPropertyOptional({ description: "Nombre d'années d'expérience", minimum: 0 })
    @Prop({ type: Number, default: 0, min: 0 })
    years: number;

    @ApiPropertyOptional({ type: [String] })
    @Prop({ type: [String], default: [] })
    skills: string[];

    @ApiProperty({ enum: ServeurStatus, default: ServeurStatus.disponible })
    @Prop({ type: String, enum: Object.values(ServeurStatus), default: ServeurStatus.disponible, index: true })
    status: ServeurStatus;

    @ApiPropertyOptional({ description: 'État actif/inactif' })
    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    // dateCreation demandé : on expose un virtual basé sur createdAt
    @ApiProperty({ description: 'Date de création (alias de createdAt)' })
    get dateCreation(): Date {
        // @ts-ignore - field injecté par timestamps
        return this.createdAt;
    }
}

export const ServeurSchema = SchemaFactory.createForClass(Serveur);