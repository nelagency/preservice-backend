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
exports.DemandeSchema = exports.Demande = exports.DemandeStatusEnum = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
const event_entity_1 = require("../../events/entities/event.entity");
var DemandeStatusEnum;
(function (DemandeStatusEnum) {
    DemandeStatusEnum["en_attente"] = "en_attente";
    DemandeStatusEnum["confirme"] = "confirme";
    DemandeStatusEnum["rejete"] = "rejete";
})(DemandeStatusEnum || (exports.DemandeStatusEnum = DemandeStatusEnum = {}));
let Demande = class Demande {
    client;
    type;
    date_proposee;
    nb_serveurs;
    status;
};
exports.Demande = Demande;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Client (User id)' }),
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Demande.prototype, "client", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: event_entity_1.EventTypeEnum }),
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(event_entity_1.EventTypeEnum), required: true }),
    __metadata("design:type", String)
], Demande.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date proposée par le client (estimation)' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Demande.prototype, "date_proposee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre de serveurs estimé' }),
    (0, mongoose_1.Prop)({ type: Number, min: 0, default: 0 }),
    __metadata("design:type", Number)
], Demande.prototype, "nb_serveurs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: DemandeStatusEnum, default: DemandeStatusEnum.en_attente }),
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(DemandeStatusEnum), default: DemandeStatusEnum.en_attente, index: true }),
    __metadata("design:type", String)
], Demande.prototype, "status", void 0);
exports.Demande = Demande = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Demande);
exports.DemandeSchema = mongoose_1.SchemaFactory.createForClass(Demande);
//# sourceMappingURL=demande.entity.js.map