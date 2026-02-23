import { ServeurService } from './serveur.service';
import { CreateServeurDto } from './dto/create-serveur.dto';
import { UpdateServeurDto } from './dto/update-serveur.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class ServeurController {
    private readonly serveurService;
    constructor(serveurService: ServeurService);
    create(createServeurDto: CreateServeurDto): Promise<import("./entities/serveur.entity").Serveur & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findAll(): import("mongoose").Query<(import("mongoose").FlattenMaps<import("./entities/serveur.entity").ServeurDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, import("./entities/serveur.entity").ServeurDocument, {}, {}> & import("./entities/serveur.entity").Serveur & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, import("./entities/serveur.entity").ServeurDocument, "find", {}>;
    serveurStatusesKV(): {
        key: string;
        value: import("./entities/serveur.entity").ServeurStatus;
    }[];
    findOne(id: string): Promise<import("mongoose").FlattenMaps<import("./entities/serveur.entity").ServeurDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    listAssignedEvents(id: string): Promise<{
        _id: any;
        title: any;
        date: any;
        role: any;
        active: boolean;
    }[]>;
    changePassword(id: string, body: ChangePasswordDto): Promise<{
        success: boolean;
    }>;
    update(id: string, updateServeurDto: UpdateServeurDto): Promise<import("mongoose").FlattenMaps<import("./entities/serveur.entity").ServeurDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
