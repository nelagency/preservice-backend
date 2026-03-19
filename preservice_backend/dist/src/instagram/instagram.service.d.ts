import { Model } from 'mongoose';
import { InstagramPost, InstagramPostDocument } from './entities/instagram-post.entity';
import { CreateInstagramPostDto } from './dto/create-instagram-post.dto';
import { UpdateInstagramPostDto } from './dto/update-instagram-post.dto';
export declare class InstagramService {
    private readonly model;
    constructor(model: Model<InstagramPostDocument>);
    findAll(): import("mongoose").Query<(import("mongoose").FlattenMaps<InstagramPostDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, InstagramPostDocument, {}, {}> & InstagramPost & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, InstagramPostDocument, "find", {}>;
    create(dto: CreateInstagramPostDto): Promise<import("mongoose").FlattenMaps<InstagramPost & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    update(id: string, dto: UpdateInstagramPostDto): Promise<import("mongoose").FlattenMaps<InstagramPostDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
