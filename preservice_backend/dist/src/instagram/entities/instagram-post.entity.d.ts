import { Document } from 'mongoose';
export type InstagramPostDocument = InstagramPost & Document;
export declare class InstagramPost {
    imageUrl: string;
    caption?: string;
    postUrl?: string;
    postedAt?: Date;
    isActive?: boolean;
}
export declare const InstagramPostSchema: import("mongoose").Schema<InstagramPost, import("mongoose").Model<InstagramPost, any, any, any, Document<unknown, any, InstagramPost, any, {}> & InstagramPost & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, InstagramPost, Document<unknown, {}, import("mongoose").FlatRecord<InstagramPost>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<InstagramPost> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
