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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaAssetSchema = exports.MediaAsset = exports.UploaderRole = exports.MediaProvider = exports.MediaKind = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var MediaKind;
(function (MediaKind) {
    MediaKind["image"] = "image";
    MediaKind["video"] = "video";
})(MediaKind || (exports.MediaKind = MediaKind = {}));
var MediaProvider;
(function (MediaProvider) {
    MediaProvider["r2"] = "r2";
    MediaProvider["stream"] = "stream";
})(MediaProvider || (exports.MediaProvider = MediaProvider = {}));
var UploaderRole;
(function (UploaderRole) {
    UploaderRole["coordinateur"] = "Coordinateur";
    UploaderRole["serveur"] = "Serveur";
    UploaderRole["admin"] = "Admin";
})(UploaderRole || (exports.UploaderRole = UploaderRole = {}));
let StreamMeta = class StreamMeta {
    uid;
    readyToStream;
    thumbnail;
    playbackUrl;
};
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], StreamMeta.prototype, "uid", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Boolean)
], StreamMeta.prototype, "readyToStream", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], StreamMeta.prototype, "thumbnail", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], StreamMeta.prototype, "playbackUrl", void 0);
StreamMeta = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], StreamMeta);
let MediaAsset = class MediaAsset {
    event;
    kind;
    provider;
    key;
    stream;
    filename;
    contentType;
    size;
    width;
    height;
    duration;
    caption;
    takenAt;
    uploader;
    uploaderRole;
    approved;
    publicUrl;
};
exports.MediaAsset = MediaAsset;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Event', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], MediaAsset.prototype, "event", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(MediaKind), required: true }),
    __metadata("design:type", String)
], MediaAsset.prototype, "kind", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(MediaProvider), required: true }),
    __metadata("design:type", String)
], MediaAsset.prototype, "provider", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MediaAsset.prototype, "key", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: StreamMeta }),
    __metadata("design:type", StreamMeta)
], MediaAsset.prototype, "stream", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MediaAsset.prototype, "filename", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MediaAsset.prototype, "contentType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 0 }),
    __metadata("design:type", Number)
], MediaAsset.prototype, "size", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 0 }),
    __metadata("design:type", Number)
], MediaAsset.prototype, "width", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 0 }),
    __metadata("design:type", Number)
], MediaAsset.prototype, "height", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 0 }),
    __metadata("design:type", Number)
], MediaAsset.prototype, "duration", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MediaAsset.prototype, "caption", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], MediaAsset.prototype, "takenAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], MediaAsset.prototype, "uploader", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(UploaderRole) }),
    __metadata("design:type", String)
], MediaAsset.prototype, "uploaderRole", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true, index: true }),
    __metadata("design:type", Boolean)
], MediaAsset.prototype, "approved", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MediaAsset.prototype, "publicUrl", void 0);
exports.MediaAsset = MediaAsset = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], MediaAsset);
exports.MediaAssetSchema = mongoose_1.SchemaFactory.createForClass(MediaAsset);
exports.MediaAssetSchema.index({ caption: 'text', filename: 'text' });
//# sourceMappingURL=media-asset.entity.js.map