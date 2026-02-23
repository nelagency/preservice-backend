import { Model } from 'mongoose';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { UpdateDemandeDto } from './dto/update-demande.dto';
import { Demande, DemandeDocument, DemandeStatusEnum } from './entities/demande.entity';
import { EventTypeEnum } from 'src/events/entities/event.entity';
export declare class DemandesService {
    private model;
    constructor(model: Model<DemandeDocument>);
    create(dto: CreateDemandeDto): Promise<import("mongoose").FlattenMaps<Demande & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & {
        createdAt: Date;
        updatedAt: Date;
    } & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    findAll(): Promise<(import("mongoose").FlattenMaps<DemandeDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<import("mongoose").FlattenMaps<DemandeDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: UpdateDemandeDto): Promise<import("mongoose").FlattenMaps<DemandeDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    typesKV(): {
        key: EventTypeEnum;
        value: EventTypeEnum;
    }[];
    statusesKV(): {
        key: DemandeStatusEnum;
        value: DemandeStatusEnum;
    }[];
}
