import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { R2Service } from './r2.service';
import { StreamService } from './stream.service';
import { MediaAsset, MediaAssetDocument, MediaKind, MediaProvider, UploaderRole } from './entities/media-asset.entity';
import { BeforeAfterPair, BeforeAfterPairDocument } from './entities/before-after.entity';
import { Event, EventDocument } from 'src/events/entities/event.entity';

@Injectable()
export class MediaService {
    constructor(
        private readonly r2: R2Service,
        private readonly stream: StreamService,
        @InjectModel(MediaAsset.name) private mediaModel: Model<MediaAssetDocument>,
        @InjectModel(BeforeAfterPair.name) private pairModel: Model<BeforeAfterPairDocument>,
        @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    ) { }

    // --- R2 (images) ---
    async requestR2Presign(params: { filename: string; contentType: string; eventId?: string; uploaderId?: string; uploaderRole?: UploaderRole; }) {
        const key = this.r2.buildObjectKey({ eventId: params.eventId, filename: params.filename });
        const { url, headers } = await this.r2.presignPut(key, params.contentType);
        return { key, uploadUrl: url, headers };
    }

    async finalizeR2Upload(body: {
        key: string; kind: MediaKind; eventId?: string; filename?: string; contentType?: string; size?: number;
        caption?: string; takenAt?: string; width?: number; height?: number; uploaderId?: string; uploaderRole?: UploaderRole;
    }) {
        const publicUrl = this.r2.publicUrl(body.key)!;
        const doc = await this.mediaModel.create({
            event: body.eventId ? new Types.ObjectId(body.eventId) : undefined,
            kind: body.kind,
            provider: MediaProvider.r2,
            key: body.key,
            filename: body.filename,
            contentType: body.contentType,
            size: body.size,
            caption: body.caption,
            takenAt: body.takenAt ? new Date(body.takenAt) : undefined,
            width: body.width, height: body.height,
            uploader: body.uploaderId ? new Types.ObjectId(body.uploaderId) : undefined,
            uploaderRole: body.uploaderRole,
            approved: true,
            publicUrl,
        });
        return doc.toJSON();
    }

    // --- Stream (vidéos) ---
    async createStreamDirectUpload() {
        return this.stream.createDirectUpload();
    }

    async finalizeStreamUpload(body: { uid: string; eventId?: string; caption?: string; takenAt?: string; duration?: number; uploaderId?: string; uploaderRole?: UploaderRole; }) {
        // rendre la vidéo publique
        await this.stream.patchVideo(body.uid, { requireSignedURLs: false });
        const playbackUrl = `https://customer-${process.env.STREAM_ACCOUNT_ID}.cloudflarestream.com/${body.uid}/manifest/video.m3u8`;


        const doc = await this.mediaModel.create({
            event: body.eventId ? new Types.ObjectId(body.eventId) : undefined,
            kind: MediaKind.video,
            provider: MediaProvider.stream,
            stream: { uid: body.uid, readyToStream: true, playbackUrl },
            caption: body.caption,
            takenAt: body.takenAt ? new Date(body.takenAt) : undefined,
            duration: body.duration,
            uploader: body.uploaderId ? new Types.ObjectId(body.uploaderId) : undefined,
            uploaderRole: body.uploaderRole,
            approved: true,
            publicUrl: playbackUrl,
        });
        return doc.toJSON();
    }

    async approveMedia(id: string, approved: boolean) {
        const updated = await this.mediaModel.findByIdAndUpdate(id, { approved }, { new: true });
        if (!updated) throw new NotFoundException('Media not found');
        return updated;
    }

    async listByEvent(eventId: string) {
        return this.mediaModel.find({ event: new Types.ObjectId(eventId) }).sort({ createdAt: -1 });
    }

    async listPairsByEvent(eventId: string) {
        return this.pairModel.find({ event: new Types.ObjectId(eventId) }).sort({ createdAt: -1 });
    }

    async createBeforeAfter(dto: { eventId: string; beforeId: string; afterId: string; caption?: string; }) {
        const pair = await this.pairModel.create({
            event: new Types.ObjectId(dto.eventId),
            before: new Types.ObjectId(dto.beforeId),
            after: new Types.ObjectId(dto.afterId),
            caption: dto.caption,
            approved: true,
        });
        return pair.toJSON();
    }

    async findAssetById(id: string) {
        return this.mediaModel.findById(id);
    }

    async deleteAsset(assetId: string) {
        const asset = await this.mediaModel.findById(assetId);
        if (!asset) throw new NotFoundException('Media not found');

        // 1) supprimer du provider
        if (asset.provider === MediaProvider.r2 && asset.key) {
            await this.r2.deleteObject(asset.key);
        }
        if (asset.provider === MediaProvider.stream && asset.stream?.uid) {
            await this.stream.deleteVideo(asset.stream.uid);
        }

        // 2) supprimer paires avant/après qui référencent cet asset
        const pairs = await this.pairModel.find({ $or: [{ before: asset._id }, { after: asset._id }] });
        const pairIds = pairs.map(p => p._id);
        if (pairIds.length) {
            await this.pairModel.deleteMany({ _id: { $in: pairIds } });
            await this.eventModel.updateMany({ beforeAfter: { $in: pairIds } }, { $pull: { beforeAfter: { $in: pairIds } } });
        }

        // 3) nettoyer références Event (cover, gallery)
        await this.eventModel.updateMany({ cover: asset._id }, { $unset: { cover: 1 } });
        await this.eventModel.updateMany({ gallery: asset._id }, { $pull: { gallery: asset._id } });

        // 4) supprimer le document
        await this.mediaModel.deleteOne({ _id: asset._id });

        return { success: true };
    }
}