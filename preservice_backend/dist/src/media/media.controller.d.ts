import { MediaService } from './media.service';
import { RequestR2PresignDto, FinalizeR2UploadDto, ApproveMediaDto, CreateBeforeAfterDto, FinalizeStreamUploadDto } from './dto/media.dto';
export declare class MediaController {
    private readonly svc;
    constructor(svc: MediaService);
    presignR2(dto: RequestR2PresignDto): Promise<{
        key: string;
        uploadUrl: string;
        headers: {
            'Content-Type': string;
        };
    }>;
    finalizeR2(dto: FinalizeR2UploadDto): Promise<import("mongoose").FlattenMaps<import("./entities/media-asset.entity").MediaAsset & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    streamToken(): Promise<{
        uploadURL: string;
        uid: string;
    }>;
    finalizeStream(dto: FinalizeStreamUploadDto): Promise<import("mongoose").FlattenMaps<import("./entities/media-asset.entity").MediaAsset & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    approve(id: string, dto: ApproveMediaDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/media-asset.entity").MediaAssetDocument, {}, {}> & import("./entities/media-asset.entity").MediaAsset & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    listByEvent(eventId: string): Promise<(import("mongoose").Document<unknown, {}, import("./entities/media-asset.entity").MediaAssetDocument, {}, {}> & import("./entities/media-asset.entity").MediaAsset & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    createPair(dto: CreateBeforeAfterDto): Promise<import("mongoose").FlattenMaps<import("./entities/before-after.entity").BeforeAfterPair & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    listPairs(eventId: string): Promise<(import("mongoose").Document<unknown, {}, import("./entities/before-after.entity").BeforeAfterPairDocument, {}, {}> & import("./entities/before-after.entity").BeforeAfterPair & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
