import { ParticipationService } from './participation.service';
import { ApplyDto, ApproveDto, AssignDto, BulkAssignDto } from './dto/create-participation.dto';
export declare class ParticipationController {
    private readonly svc;
    constructor(svc: ParticipationService);
    apply(eventId: string, dto: ApplyDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/participation.entity").ParticipationDocument, {}, {}> & import("./entities/participation.entity").Participation & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    approve(eventId: string, id: string, dto: ApproveDto, req: any): Promise<import("mongoose").FlattenMaps<import("./entities/participation.entity").ParticipationDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    assign(eventId: string, id: string, dto: AssignDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/participation.entity").ParticipationDocument, {}, {}> & import("./entities/participation.entity").Participation & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    bulk(eventId: string, dto: BulkAssignDto): Promise<void>;
    kpis(eventId: string): Promise<{
        confirmed: number;
        pending: number;
        unassigned: number;
        total: any;
    }>;
    confirmAll(eventId: string): Promise<void>;
    findByEvent(eventId: string): Promise<(import("mongoose").FlattenMaps<import("./entities/participation.entity").ParticipationDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    findByServeur(serveurId: string): Promise<(import("mongoose").FlattenMaps<import("./entities/participation.entity").ParticipationDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
}
