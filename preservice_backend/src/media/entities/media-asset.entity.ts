import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


export type MediaAssetDocument = MediaAsset & Document;


export enum MediaKind { image = 'image', video = 'video' }
export enum MediaProvider { r2 = 'r2', stream = 'stream' }
export enum UploaderRole { coordinateur = 'Coordinateur', serveur = 'Serveur', admin = 'Admin' }

@Schema({ _id: false })
class StreamMeta {
    @Prop() uid?: string; // UID Stream
    @Prop() readyToStream?: boolean;
    @Prop() thumbnail?: string; // URL miniature
    @Prop() playbackUrl?: string; // HLS public
}

@Schema({ timestamps: true })
export class MediaAsset {
    @Prop({ type: Types.ObjectId, ref: 'Event', index: true }) event?: Types.ObjectId;

    @Prop({ type: String, enum: Object.values(MediaKind), required: true })
    kind: MediaKind;

    @Prop({ type: String, enum: Object.values(MediaProvider), required: true })
    provider: MediaProvider;

    // R2
    @Prop() key?: string; // chemin objet R2 (ex: events/<id>/uuid.jpg)

    // Stream
    @Prop({ type: StreamMeta }) stream?: StreamMeta;

    // Méta communes
    @Prop() filename?: string;
    @Prop() contentType?: string;
    @Prop({ type: Number, min: 0 }) size?: number;
    @Prop({ type: Number, min: 0 }) width?: number;
    @Prop({ type: Number, min: 0 }) height?: number;
    @Prop({ type: Number, min: 0 }) duration?: number; // s (vidéo)
    @Prop() caption?: string;
    @Prop() takenAt?: Date;

    // Uploader
    @Prop({ type: Types.ObjectId, ref: 'User', index: true }) uploader?: Types.ObjectId;
    @Prop({ type: String, enum: Object.values(UploaderRole) }) uploaderRole?: UploaderRole;

    // Publication publique (100% public dès l'upload)
    @Prop({ type: Boolean, default: true, index: true }) approved: boolean;
    @Prop() publicUrl?: string; // image R2 ou playback HLS pour Stream
}

export const MediaAssetSchema = SchemaFactory.createForClass(MediaAsset);
(MediaAssetSchema as any).index({ caption: 'text', filename: 'text' });