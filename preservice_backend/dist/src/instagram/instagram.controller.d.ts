import { InstagramService } from './instagram.service';
import { CreateInstagramPostDto } from './dto/create-instagram-post.dto';
import { UpdateInstagramPostDto } from './dto/update-instagram-post.dto';
export declare class InstagramController {
    private readonly instagramService;
    constructor(instagramService: InstagramService);
    findAll(): import("mongoose").Query<(import("mongoose").FlattenMaps<import("./entities/instagram-post.entity").InstagramPostDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, import("./entities/instagram-post.entity").InstagramPostDocument, {}, {}> & import("./entities/instagram-post.entity").InstagramPost & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, import("./entities/instagram-post.entity").InstagramPostDocument, "find", {}>;
    create(dto: CreateInstagramPostDto): Promise<import("mongoose").FlattenMaps<import("./entities/instagram-post.entity").InstagramPost & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    update(id: string, dto: UpdateInstagramPostDto): Promise<import("mongoose").FlattenMaps<import("./entities/instagram-post.entity").InstagramPostDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
