export declare class R2Service {
    private s3;
    private bucket;
    buildObjectKey(opts: {
        eventId?: string;
        filename: string;
    }): string;
    presignPut(key: string, contentType: string, expiresSeconds?: number): Promise<{
        url: string;
        headers: {
            'Content-Type': string;
        };
    }>;
    deleteObject(key: string): Promise<{
        success: boolean;
    }>;
    publicUrl(key: string): string | null;
}
