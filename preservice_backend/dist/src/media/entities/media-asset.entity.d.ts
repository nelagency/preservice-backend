import { Document, Types } from 'mongoose';
export type MediaAssetDocument = MediaAsset & Document;
export declare enum MediaKind {
    image = "image",
    video = "video"
}
export declare enum MediaProvider {
    r2 = "r2",
    stream = "stream"
}
export declare enum UploaderRole {
    coordinateur = "Coordinateur",
    serveur = "Serveur",
    admin = "Admin"
}
declare class StreamMeta {
    uid?: string;
    readyToStream?: boolean;
    thumbnail?: string;
    playbackUrl?: string;
}
export declare class MediaAsset {
    event?: Types.ObjectId;
    kind: MediaKind;
    provider: MediaProvider;
    key?: string;
    stream?: StreamMeta;
    filename?: string;
    contentType?: string;
    size?: number;
    width?: number;
    height?: number;
    duration?: number;
    caption?: string;
    takenAt?: Date;
    uploader?: Types.ObjectId;
    uploaderRole?: UploaderRole;
    approved: boolean;
    publicUrl?: string;
}
export declare const MediaAssetSchema: import("mongoose").Schema<MediaAsset, import("mongoose").Model<MediaAsset, any, any, any, Document<unknown, any, MediaAsset, any, {}> & MediaAsset & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MediaAsset, Document<unknown, {}, import("mongoose").FlatRecord<MediaAsset>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<MediaAsset> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export {};
