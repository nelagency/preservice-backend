import { Model } from 'mongoose';
import { CreateServeurDto } from './dto/create-serveur.dto';
import { UpdateServeurDto } from './dto/update-serveur.dto';
import { Serveur, ServeurDocument, ServeurStatus } from './entities/serveur.entity';
import { EventDocument } from 'src/events/entities/event.entity';
import { ParticipationDocument } from 'src/participation/entities/participation.entity';
export declare class ServeurService {
    private model;
    private readonly eventModel;
    private readonly participationModel;
    constructor(model: Model<ServeurDocument>, eventModel: Model<EventDocument>, participationModel: Model<ParticipationDocument>);
    create(dto: CreateServeurDto): Promise<Serveur & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findAll(): import("mongoose").Query<(import("mongoose").FlattenMaps<ServeurDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, ServeurDocument, {}, {}> & Serveur & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, ServeurDocument, "find", {}>;
    findOne(id: string): Promise<import("mongoose").FlattenMaps<ServeurDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: UpdateServeurDto): Promise<import("mongoose").FlattenMaps<ServeurDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    serveurStatusesKV(): {
        key: string;
        value: ServeurStatus;
    }[];
    listAssignedEvents(serverId: string): Promise<{
        _id: any;
        title: any;
        date: any;
        role: any;
        active: boolean;
    }[]>;
    changePassword(id: string, { currentPassword, newPassword }: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
    }>;
}
