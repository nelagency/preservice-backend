import { AvisService } from './avis.service';
import { CreateAviDto } from './dto/create-avi.dto';
import { UpdateAviDto } from './dto/update-avi.dto';
export declare class AvisController {
    private readonly avisService;
    constructor(avisService: AvisService);
    create(createAviDto: CreateAviDto): Promise<import("mongoose").FlattenMaps<import("./entities/avi.entity").Avi & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    findAll(): Promise<(import("mongoose").FlattenMaps<import("./entities/avi.entity").AvisDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<import("mongoose").FlattenMaps<import("./entities/avi.entity").AvisDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    update(id: string, updateAviDto: UpdateAviDto): Promise<import("mongoose").FlattenMaps<import("./entities/avi.entity").AvisDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
