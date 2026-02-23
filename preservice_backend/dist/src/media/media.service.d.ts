import { Model } from 'mongoose';
import { R2Service } from './r2.service';
import { StreamService } from './stream.service';
import { MediaAsset, MediaAssetDocument, MediaKind, UploaderRole } from './entities/media-asset.entity';
import { BeforeAfterPair, BeforeAfterPairDocument } from './entities/before-after.entity';
import { EventDocument } from 'src/events/entities/event.entity';
export declare class MediaService {
    private readonly r2;
    private readonly stream;
    private mediaModel;
    private pairModel;
    private eventModel;
    constructor(r2: R2Service, stream: StreamService, mediaModel: Model<MediaAssetDocument>, pairModel: Model<BeforeAfterPairDocument>, eventModel: Model<EventDocument>);
    requestR2Presign(params: {
        filename: string;
        contentType: string;
        eventId?: string;
        uploaderId?: string;
        uploaderRole?: UploaderRole;
    }): Promise<{
        key: string;
        uploadUrl: string;
        headers: {
            'Content-Type': string;
        };
    }>;
    finalizeR2Upload(body: {
        key: string;
        kind: MediaKind;
        eventId?: string;
        filename?: string;
        contentType?: string;
        size?: number;
        caption?: string;
        takenAt?: string;
        width?: number;
        height?: number;
        uploaderId?: string;
        uploaderRole?: UploaderRole;
    }): Promise<import("mongoose").FlattenMaps<MediaAsset & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    createStreamDirectUpload(): Promise<{
        uploadURL: string;
        uid: string;
    }>;
    finalizeStreamUpload(body: {
        uid: string;
        eventId?: string;
        caption?: string;
        takenAt?: string;
        duration?: number;
        uploaderId?: string;
        uploaderRole?: UploaderRole;
    }): Promise<import("mongoose").FlattenMaps<MediaAsset & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    approveMedia(id: string, approved: boolean): Promise<import("mongoose").Document<unknown, {}, MediaAssetDocument, {}, {}> & MediaAsset & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    listByEvent(eventId: string): Promise<(import("mongoose").Document<unknown, {}, MediaAssetDocument, {}, {}> & MediaAsset & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    listPairsByEvent(eventId: string): Promise<(import("mongoose").Document<unknown, {}, BeforeAfterPairDocument, {}, {}> & BeforeAfterPair & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    createBeforeAfter(dto: {
        eventId: string;
        beforeId: string;
        afterId: string;
        caption?: string;
    }): Promise<import("mongoose").FlattenMaps<BeforeAfterPair & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    findAssetById(id: string): Promise<(import("mongoose").Document<unknown, {}, MediaAssetDocument, {}, {}> & MediaAsset & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
    deleteAsset(assetId: string): Promise<{
        success: boolean;
    }>;
}
