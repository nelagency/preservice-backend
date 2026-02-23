"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.R2Service = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const crypto_1 = require("crypto");
let R2Service = class R2Service {
    s3 = new client_s3_1.S3Client({
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
    });
    bucket = process.env.R2_BUCKET;
    buildObjectKey(opts) {
        const base = opts.eventId ? `events/${opts.eventId}` : 'unassigned';
        const safe = opts.filename.replace(/[^^\w.\-]+/g, '_');
        return `${base}/${(0, crypto_1.randomUUID)()}-${safe}`;
    }
    async presignPut(key, contentType, expiresSeconds = 900) {
        const cmd = new client_s3_1.PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3, cmd, { expiresIn: expiresSeconds });
        return { url, headers: { 'Content-Type': contentType } };
    }
    async deleteObject(key) {
        await this.s3.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
        return { success: true };
    }
    publicUrl(key) {
        const base = process.env.R2_PUBLIC_BASE_URL;
        return base ? `${base.replace(/\/$/, '')}/${encodeURI(key)}` : null;
    }
};
exports.R2Service = R2Service;
exports.R2Service = R2Service = __decorate([
    (0, common_1.Injectable)()
], R2Service);
//# sourceMappingURL=r2.service.js.map