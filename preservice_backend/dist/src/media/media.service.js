"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const r2_service_1 = require("./r2.service");
const stream_service_1 = require("./stream.service");
const media_asset_entity_1 = require("./entities/media-asset.entity");
const before_after_entity_1 = require("./entities/before-after.entity");
const event_entity_1 = require("../events/entities/event.entity");
let MediaService = class MediaService {
    r2;
    stream;
    mediaModel;
    pairModel;
    eventModel;
    constructor(r2, stream, mediaModel, pairModel, eventModel) {
        this.r2 = r2;
        this.stream = stream;
        this.mediaModel = mediaModel;
        this.pairModel = pairModel;
        this.eventModel = eventModel;
    }
    async requestR2Presign(params) {
        const key = this.r2.buildObjectKey({ eventId: params.eventId, filename: params.filename });
        const { url, headers } = await this.r2.presignPut(key, params.contentType);
        return { key, uploadUrl: url, headers };
    }
    async finalizeR2Upload(body) {
        const publicUrl = this.r2.publicUrl(body.key);
        const doc = await this.mediaModel.create({
            event: body.eventId ? new mongoose_2.Types.ObjectId(body.eventId) : undefined,
            kind: body.kind,
            provider: media_asset_entity_1.MediaProvider.r2,
            key: body.key,
            filename: body.filename,
            contentType: body.contentType,
            size: body.size,
            caption: body.caption,
            takenAt: body.takenAt ? new Date(body.takenAt) : undefined,
            width: body.width, height: body.height,
            uploader: body.uploaderId ? new mongoose_2.Types.ObjectId(body.uploaderId) : undefined,
            uploaderRole: body.uploaderRole,
            approved: true,
            publicUrl,
        });
        return doc.toJSON();
    }
    async createStreamDirectUpload() {
        return this.stream.createDirectUpload();
    }
    async finalizeStreamUpload(body) {
        await this.stream.patchVideo(body.uid, { requireSignedURLs: false });
        const playbackUrl = `https://customer-${process.env.STREAM_ACCOUNT_ID}.cloudflarestream.com/${body.uid}/manifest/video.m3u8`;
        const doc = await this.mediaModel.create({
            event: body.eventId ? new mongoose_2.Types.ObjectId(body.eventId) : undefined,
            kind: media_asset_entity_1.MediaKind.video,
            provider: media_asset_entity_1.MediaProvider.stream,
            stream: { uid: body.uid, readyToStream: true, playbackUrl },
            caption: body.caption,
            takenAt: body.takenAt ? new Date(body.takenAt) : undefined,
            duration: body.duration,
            uploader: body.uploaderId ? new mongoose_2.Types.ObjectId(body.uploaderId) : undefined,
            uploaderRole: body.uploaderRole,
            approved: true,
            publicUrl: playbackUrl,
        });
        return doc.toJSON();
    }
    async approveMedia(id, approved) {
        const updated = await this.mediaModel.findByIdAndUpdate(id, { approved }, { new: true });
        if (!updated)
            throw new common_1.NotFoundException('Media not found');
        return updated;
    }
    async listByEvent(eventId) {
        return this.mediaModel.find({ event: new mongoose_2.Types.ObjectId(eventId) }).sort({ createdAt: -1 });
    }
    async listPairsByEvent(eventId) {
        return this.pairModel.find({ event: new mongoose_2.Types.ObjectId(eventId) }).sort({ createdAt: -1 });
    }
    async createBeforeAfter(dto) {
        const pair = await this.pairModel.create({
            event: new mongoose_2.Types.ObjectId(dto.eventId),
            before: new mongoose_2.Types.ObjectId(dto.beforeId),
            after: new mongoose_2.Types.ObjectId(dto.afterId),
            caption: dto.caption,
            approved: true,
        });
        return pair.toJSON();
    }
    async findAssetById(id) {
        return this.mediaModel.findById(id);
    }
    async deleteAsset(assetId) {
        const asset = await this.mediaModel.findById(assetId);
        if (!asset)
            throw new common_1.NotFoundException('Media not found');
        if (asset.provider === media_asset_entity_1.MediaProvider.r2 && asset.key) {
            await this.r2.deleteObject(asset.key);
        }
        if (asset.provider === media_asset_entity_1.MediaProvider.stream && asset.stream?.uid) {
            await this.stream.deleteVideo(asset.stream.uid);
        }
        const pairs = await this.pairModel.find({ $or: [{ before: asset._id }, { after: asset._id }] });
        const pairIds = pairs.map(p => p._id);
        if (pairIds.length) {
            await this.pairModel.deleteMany({ _id: { $in: pairIds } });
            await this.eventModel.updateMany({ beforeAfter: { $in: pairIds } }, { $pull: { beforeAfter: { $in: pairIds } } });
        }
        await this.eventModel.updateMany({ cover: asset._id }, { $unset: { cover: 1 } });
        await this.eventModel.updateMany({ gallery: asset._id }, { $pull: { gallery: asset._id } });
        await this.mediaModel.deleteOne({ _id: asset._id });
        return { success: true };
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, mongoose_1.InjectModel)(media_asset_entity_1.MediaAsset.name)),
    __param(3, (0, mongoose_1.InjectModel)(before_after_entity_1.BeforeAfterPair.name)),
    __param(4, (0, mongoose_1.InjectModel)(event_entity_1.Event.name)),
    __metadata("design:paramtypes", [r2_service_1.R2Service,
        stream_service_1.StreamService,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], MediaService);
//# sourceMappingURL=media.service.js.map