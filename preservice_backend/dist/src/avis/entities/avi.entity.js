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
exports.AvisSchema = exports.Avi = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
let Avi = class Avi {
    note;
    commentaire;
    client;
    event;
    etat;
};
exports.Avi = Avi;
__decorate([
    (0, swagger_1.ApiProperty)({ minimum: 1, maximum: 5 }),
    (0, mongoose_1.Prop)({ type: Number, required: true, min: 1, max: 5 }),
    __metadata("design:type", Number)
], Avi.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], Avi.prototype, "commentaire", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Client (User id)' }),
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Avi.prototype, "client", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Événement (Event id) associé" }),
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Event', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Avi.prototype, "event", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Affiché (true) ou masqué (false)', default: true }),
    (0, mongoose_1.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], Avi.prototype, "etat", void 0);
exports.Avi = Avi = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Avi);
exports.AvisSchema = mongoose_1.SchemaFactory.createForClass(Avi);
//# sourceMappingURL=avi.entity.js.map