import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EventRoleEnum } from 'src/events/entities/event.entity'; 

export type ParticipationDocument = Participation & Document;

export enum CandidatureStatus { pending = 'pending', approved = 'approved', rejected = 'rejected' }
export enum AssignmentStatus { none = 'none', provisional = 'provisional', confirmed = 'confirmed' } 

@Schema({ timestamps: true })
export class Participation {
    @Prop({ type: Types.ObjectId, ref: 'Event', required: true, index: true }) 
    event: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Serveur', required: true, index: true })
    serveur: Types.ObjectId;

    @Prop({ type: String, enum: Object.values(CandidatureStatus), default: CandidatureStatus.pending })
    candidatureStatus: CandidatureStatus;

    @Prop({ type: String, enum: Object.values(EventRoleEnum), default: null })
    role?: EventRoleEnum | null;

    @Prop({ type: String, enum: Object.values(AssignmentStatus), default: AssignmentStatus.none })
    assignmentStatus: AssignmentStatus;

    @Prop() notes?: string;
    @Prop() approvedAt?: Date;
    @Prop() assignedAt?: Date;
}

export const ParticipationSchema = SchemaFactory.createForClass(Participation);

ParticipationSchema.index({ event: 1, serveur: 1 }, { unique: true }); 