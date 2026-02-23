type DirectUploadResp = {
    uploadURL: string;
    uid: string;
};
export declare class StreamService {
    private accountId;
    private apiToken;
    createDirectUpload(): Promise<DirectUploadResp>;
    patchVideo(uid: string, body: any): Promise<any>;
    deleteVideo(uid: string): Promise<{
        success: boolean;
    }>;
}
export {};
