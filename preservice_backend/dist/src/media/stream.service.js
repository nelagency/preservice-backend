"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamService = void 0;
const common_1 = require("@nestjs/common");
let StreamService = class StreamService {
    accountId = process.env.STREAM_ACCOUNT_ID;
    apiToken = process.env.STREAM_API_TOKEN;
    async createDirectUpload() {
        const resp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/direct_upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${this.apiToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
        const json = await resp.json();
        if (!json.success)
            throw new Error(`Stream direct upload failed: ${JSON.stringify(json.errors)}`);
        return { uploadURL: json.result.uploadURL, uid: json.result.uid };
    }
    async patchVideo(uid, body) {
        const resp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/${uid}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${this.apiToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const json = await resp.json();
        if (!json.success)
            throw new Error(`Stream patch failed: ${JSON.stringify(json.errors)}`);
        return json.result;
    }
    async deleteVideo(uid) {
        const resp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/${uid}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${this.apiToken}` },
        });
        const json = await resp.json();
        if (!json.success)
            throw new Error(`Stream delete failed: ${JSON.stringify(json.errors)}`);
        return { success: true };
    }
};
exports.StreamService = StreamService;
exports.StreamService = StreamService = __decorate([
    (0, common_1.Injectable)()
], StreamService);
//# sourceMappingURL=stream.service.js.map