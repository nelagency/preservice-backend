import { DemandesService } from './demandes.service';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { UpdateDemandeDto } from './dto/update-demande.dto';
export declare class DemandesController {
    private readonly demandesService;
    constructor(demandesService: DemandesService);
    create(createDemandeDto: CreateDemandeDto): Promise<import("mongoose").FlattenMaps<import("./entities/demande.entity").Demande & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & {
        createdAt: Date;
        updatedAt: Date;
    } & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    findAll(): Promise<(import("mongoose").FlattenMaps<import("./entities/demande.entity").DemandeDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    typesKV(): {
        key: import("../events/entities/event.entity").EventTypeEnum;
        value: import("../events/entities/event.entity").EventTypeEnum;
    }[];
    statusesKV(): {
        key: import("./entities/demande.entity").DemandeStatusEnum;
        value: import("./entities/demande.entity").DemandeStatusEnum;
    }[];
    findOne(id: string): Promise<import("mongoose").FlattenMaps<import("./entities/demande.entity").DemandeDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    update(id: string, updateDemandeDto: UpdateDemandeDto): Promise<import("mongoose").FlattenMaps<import("./entities/demande.entity").DemandeDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
