import { AssignDto, BulkAssignDto, CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import { EventDocument } from 'src/events/entities/event.entity';
import { Model } from 'mongoose';
import { CandidatureStatus, Participation, ParticipationDocument } from './entities/participation.entity';
import { MailService } from 'src/mail/mail.service';
import { NotificationsService } from 'src/notifications/notifications.service';
export declare class ParticipationService {
    private model;
    private eventModel;
    private readonly mail;
    private readonly notifications;
    constructor(model: Model<ParticipationDocument>, eventModel: Model<EventDocument>, mail: MailService, notifications: NotificationsService);
    apply(eventId: string, serveurId: string, notes?: string): Promise<import("mongoose").Document<unknown, {}, ParticipationDocument, {}, {}> & Participation & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    applyEvent(eventId: string, serveurId: string, notes?: string, adminIds?: string[]): Promise<import("mongoose").Document<unknown, {}, ParticipationDocument, {}, {}> & Participation & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    setCandidatureStatus(eventId: string, participationId: string, status: CandidatureStatus): Promise<import("mongoose").FlattenMaps<ParticipationDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    setCandidatureStatusEvent(eventId: string, participationId: string, status: CandidatureStatus, adminId: string): Promise<import("mongoose").FlattenMaps<ParticipationDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    assignRole(eventId: string, participationId: string, dto: AssignDto): Promise<import("mongoose").Document<unknown, {}, ParticipationDocument, {}, {}> & Participation & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    private ensureCapacity;
    confirmAll(eventId: string): Promise<void>;
    confirmAllEvent(eventId: string): Promise<void>;
    bulkReplaceAssignments(eventId: string, payload: BulkAssignDto): Promise<void>;
    kpis(eventId: string): Promise<{
        confirmed: number;
        pending: number;
        unassigned: number;
        total: any;
    }>;
    private totalSlots;
    findByEvent(eventId: string): Promise<(import("mongoose").FlattenMaps<ParticipationDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    findByServeur(serveurId: string): Promise<(import("mongoose").FlattenMaps<ParticipationDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    create(createParticipationDto: CreateParticipationDto): string;
    findAll(): import("mongoose").Query<(import("mongoose").Document<unknown, {}, ParticipationDocument, {}, {}> & Participation & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, ParticipationDocument, {}, {}> & Participation & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, ParticipationDocument, "find", {}>;
    findOne(id: number): import("mongoose").Query<(import("mongoose").Document<unknown, {}, ParticipationDocument, {}, {}> & Participation & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null, import("mongoose").Document<unknown, {}, ParticipationDocument, {}, {}> & Participation & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, ParticipationDocument, "findOne", {}>;
    update(id: number, updateParticipationDto: UpdateParticipationDto): string;
    remove(id: string): Promise<{
        ok: boolean;
    }>;
}
