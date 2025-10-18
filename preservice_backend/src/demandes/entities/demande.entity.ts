import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventTypeEnum } from 'src/events/entities/event.entity';

export type DemandeDocument = Demande & Document & {
    createdAt: Date;
    updatedAt: Date;
};

export enum DemandeStatusEnum {
    en_attente = 'en_attente',
    confirme = 'confirme',
    rejete = 'rejete',
}

@Schema({ timestamps: true })
export class Demande {
    @ApiProperty({ description: 'Client (User id)' })
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    client: Types.ObjectId;

    @ApiProperty({ enum: EventTypeEnum })
    @Prop({ type: String, enum: Object.values(EventTypeEnum), required: true })
    type: EventTypeEnum;

    @ApiProperty({ description: 'Date proposée par le client (estimation)' })
    @Prop({ required: true })
    date_proposee: Date;

    @ApiProperty({ description: 'Nombre de serveurs estimé' })
    @Prop({ type: Number, min: 0, default: 0 })
    nb_serveurs: number;

    @ApiProperty({ enum: DemandeStatusEnum, default: DemandeStatusEnum.en_attente })
    @Prop({ type: String, enum: Object.values(DemandeStatusEnum), default: DemandeStatusEnum.en_attente, index: true })
    status: DemandeStatusEnum;
}

export const DemandeSchema = SchemaFactory.createForClass(Demande);