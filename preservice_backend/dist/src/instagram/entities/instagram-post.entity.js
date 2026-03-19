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
exports.InstagramPostSchema = exports.InstagramPost = void 0;
const swagger_1 = require("@nestjs/swagger");
const mongoose_1 = require("@nestjs/mongoose");
let InstagramPost = class InstagramPost {
    imageUrl;
    caption;
    postUrl;
    postedAt;
    isActive;
};
exports.InstagramPost = InstagramPost;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Image URL du post Instagram' }),
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], InstagramPost.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Texte/description du post' }),
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], InstagramPost.prototype, "caption", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lien public vers le post Instagram' }),
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], InstagramPost.prototype, "postUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date de publication du post' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], InstagramPost.prototype, "postedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, mongoose_1.Prop)({ default: true, index: true }),
    __metadata("design:type", Boolean)
], InstagramPost.prototype, "isActive", void 0);
exports.InstagramPost = InstagramPost = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], InstagramPost);
exports.InstagramPostSchema = mongoose_1.SchemaFactory.createForClass(InstagramPost);
//# sourceMappingURL=instagram-post.entity.js.map