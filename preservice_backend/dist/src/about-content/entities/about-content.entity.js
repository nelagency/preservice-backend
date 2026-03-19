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
exports.AboutContentSchema = exports.AboutContent = void 0;
const swagger_1 = require("@nestjs/swagger");
const mongoose_1 = require("@nestjs/mongoose");
let AboutSection = class AboutSection {
    title;
    content;
};
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], AboutSection.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], AboutSection.prototype, "content", void 0);
AboutSection = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], AboutSection);
const AboutSectionSchema = mongoose_1.SchemaFactory.createForClass(AboutSection);
let AboutContent = class AboutContent {
    key;
    vision;
    histoire;
    valeurs;
    founderImages;
    sections;
};
exports.AboutContent = AboutContent;
__decorate([
    (0, swagger_1.ApiProperty)({ default: 'main' }),
    (0, mongoose_1.Prop)({ required: true, unique: true, default: 'main', index: true }),
    __metadata("design:type", String)
], AboutContent.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], AboutContent.prototype, "vision", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], AboutContent.prototype, "histoire", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], default: [] }),
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], AboutContent.prototype, "valeurs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], default: [] }),
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], AboutContent.prototype, "founderImages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Object], default: [] }),
    (0, mongoose_1.Prop)({ type: [AboutSectionSchema], default: [] }),
    __metadata("design:type", Array)
], AboutContent.prototype, "sections", void 0);
exports.AboutContent = AboutContent = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], AboutContent);
exports.AboutContentSchema = mongoose_1.SchemaFactory.createForClass(AboutContent);
//# sourceMappingURL=about-content.entity.js.map