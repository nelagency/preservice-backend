import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type EventDocument = Event & Document;

export enum EventTypeEnum {
    Mariages = 'Mariages',
    Buffets = 'Buffets',
    Baptemes = 'Baptêmes',
    Anniversaires = 'Anniversaires',
    Entreprise = 'Entreprise',
}

export enum EventStatusEnum {
    confirme = 'Confirmé',
    en_attente = 'En attente',
    prepare = 'Preparé',
    termine = 'Terminé'
}

export enum EventEtatEnum {
    ouvert = 'Ouvert',
    complet = 'Complet',
    urgent = 'Urgent'
}

//
export enum EventRoleEnum {
    coordinateur = 'Coordinateur',
    serveur = 'Serveur',
    hotesse = 'Hotesse',
    accueil = 'Accueil',
    barman = 'Barman',
    serviceVip = 'Service VIP',
}

//
class EventPositionReq {
    @Prop({ type: String, enum: Object.values(EventRoleEnum), required: true })
    role: EventRoleEnum;

    @Prop({ type: Number, min: 0, default: 1 })
    capacity: number;
}

@Schema({ timestamps: true })
export class Event {
    @ApiProperty({ description: 'Nom / titre de l’événement' })
    @Prop({ required: true, trim: true })
    title: string;

    @ApiProperty({ description: 'Description de l`\'évènement' })
    @Prop({ trim: true })
    description?: string;

    @ApiProperty({ description: 'Lieu de l\'événement' })
    @Prop({ required: true, trim: true })
    location: string;

    @ApiProperty({ description: 'Date de debut de l’événement (ISO 8601)' })
    @Prop({ required: true })
    startdate: Date;

    @ApiProperty({ description: 'Date de fin de l’événement (ISO 8601)' })
    @Prop({ required: true })
    enddate: Date;

    @ApiProperty({ enum: EventTypeEnum })
    @Prop({ required: true, enum: Object.values(EventTypeEnum), index: true })
    type: EventTypeEnum;

    @ApiProperty({ description: 'Liste des serveurs (IDs)', type: [String] })
    @Prop({ type: [{ type: Types.ObjectId, ref: 'Serveur' }], default: [] })
    serveurs: Types.ObjectId[];

    @ApiProperty({ description: "Nombre d'invités" })
    @Prop({ type: Number, min: 0, default: 0 })
    guests: number;

    @ApiProperty({ description: "Nombre d'invités" })
    @Prop({ type: Number, min: 0, default: 0 })
    nbServeur: number;

    @ApiProperty({ description: "Status de l'évènement", enum: EventStatusEnum, default: EventStatusEnum.en_attente })
    @Prop({ type: String, enum: Object.values(EventStatusEnum), default: EventStatusEnum.en_attente, index: true })
    status: EventStatusEnum;

    @ApiProperty({ description: "Etat de l'évènement", enum: EventEtatEnum, default: EventEtatEnum.ouvert })
    @Prop({ type: String, enum: Object.values(EventEtatEnum), default: EventEtatEnum.ouvert, index: true })
    etat: EventEtatEnum;

    @ApiProperty({ description: 'Montant à payer' })
    @Prop({ type: Number, min: 0, default: 0 })
    amount: number;

    //
    @ApiProperty({ type: [EventPositionReq] })
    @Prop({ type: [{ role: String, capacity: Number }], default: [] })
    positions: EventPositionReq[];
}

export const EventSchema = SchemaFactory.createForClass(Event);

(EventSchema as any).index({ title: 'text', description: 'text', 'client.name': 'text' });