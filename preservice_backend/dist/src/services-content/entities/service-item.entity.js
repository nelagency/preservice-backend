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
exports.ServiceItemSchema = exports.ServiceItem = void 0;
const swagger_1 = require("@nestjs/swagger");
const mongoose_1 = require("@nestjs/mongoose");
let ServiceItem = class ServiceItem {
    title;
    description;
    slug;
    imageUrl;
    isActive;
};
exports.ServiceItem = ServiceItem;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Événements privés' }),
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ServiceItem.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Organisation clé en main pour mariages, anniversaires, etc.',
    }),
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ServiceItem.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'evenements-prives' }),
    (0, mongoose_1.Prop)({ required: true, trim: true, unique: true, index: true }),
    __metadata("design:type", String)
], ServiceItem.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '/media/services/prive.jpg', required: false }),
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], ServiceItem.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, mongoose_1.Prop)({ type: Boolean, default: true, index: true }),
    __metadata("design:type", Boolean)
], ServiceItem.prototype, "isActive", void 0);
exports.ServiceItem = ServiceItem = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ServiceItem);
exports.ServiceItemSchema = mongoose_1.SchemaFactory.createForClass(ServiceItem);
//# sourceMappingURL=service-item.entity.js.map