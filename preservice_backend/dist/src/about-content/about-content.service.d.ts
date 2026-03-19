import { Model } from 'mongoose';
import { UpdateAboutContentDto } from './dto/update-about-content.dto';
import { AboutContent, AboutContentDocument } from './entities/about-content.entity';
export declare class AboutContentService {
    private readonly model;
    constructor(model: Model<AboutContentDocument>);
    getContent(): Promise<(import("mongoose").FlattenMaps<AboutContentDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }) | import("mongoose").FlattenMaps<AboutContent & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & {
        createdAt: Date;
        updatedAt: Date;
    } & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    updateContent(dto: UpdateAboutContentDto): Promise<import("mongoose").FlattenMaps<AboutContentDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
}
