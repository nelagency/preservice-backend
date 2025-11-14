import { Injectable } from '@nestjs/common';

type DirectUploadResp = { uploadURL: string; uid: string };

@Injectable()
export class StreamService {
    private accountId = process.env.STREAM_ACCOUNT_ID!;
    private apiToken = process.env.STREAM_API_TOKEN!;

    async createDirectUpload(): Promise<DirectUploadResp> {
        const resp = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/direct_upload`,
            {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.apiToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ /* resumable:true, maxDurationSeconds: ... */ }),
            }
        );
        const json = await resp.json();
        if (!json.success) throw new Error(`Stream direct upload failed: ${JSON.stringify(json.errors)}`);
        return { uploadURL: json.result.uploadURL, uid: json.result.uid };
    }

    async patchVideo(uid: string, body: any) {
        const resp = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/${uid}`,
            {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${this.apiToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            }
        );
        const json = await resp.json();
        if (!json.success) throw new Error(`Stream patch failed: ${JSON.stringify(json.errors)}`);
        return json.result;
    }

    async deleteVideo(uid: string) {
        const resp = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/${uid}`,
            {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.apiToken}` },
            }
        );
        const json = await resp.json();
        if (!json.success) throw new Error(`Stream delete failed: ${JSON.stringify(json.errors)}`);
        return { success: true };
    }
}