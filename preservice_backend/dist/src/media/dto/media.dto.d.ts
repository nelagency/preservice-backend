import { MediaKind, UploaderRole } from '../entities/media-asset.entity';
export declare class RequestR2PresignDto {
    filename: string;
    contentType: string;
    eventId?: string;
    uploaderRole?: UploaderRole;
}
export declare class FinalizeR2UploadDto {
    key: string;
    kind: MediaKind;
    eventId?: string;
    filename?: string;
    contentType?: string;
    size?: number;
    takenAt?: string;
    caption?: string;
    width?: number;
    height?: number;
    uploaderId?: string;
    uploaderRole?: UploaderRole;
}
export declare class CreateStreamDirectUploadDto {
    eventId?: string;
    filename?: string;
    uploaderRole?: UploaderRole;
}
export declare class FinalizeStreamUploadDto {
    uid: string;
    eventId?: string;
    caption?: string;
    takenAt?: string;
    duration?: number;
    uploaderId?: string;
}
export declare class ApproveMediaDto {
    approved: boolean;
}
export declare class CreateBeforeAfterDto {
    eventId: string;
    beforeId: string;
    afterId: string;
    caption?: string;
}
