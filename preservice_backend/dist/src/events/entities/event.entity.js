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
exports.EventSchema = exports.Event = exports.EventRoleEnum = exports.EventEtatEnum = exports.EventStatusEnum = exports.EventTypeEnum = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
var EventTypeEnum;
(function (EventTypeEnum) {
    EventTypeEnum["Mariages"] = "Mariages";
    EventTypeEnum["Buffets"] = "Buffets";
    EventTypeEnum["Baptemes"] = "Bapt\u00EAmes";
    EventTypeEnum["Anniversaires"] = "Anniversaires";
    EventTypeEnum["Entreprise"] = "Entreprise";
})(EventTypeEnum || (exports.EventTypeEnum = EventTypeEnum = {}));
var EventStatusEnum;
(function (EventStatusEnum) {
    EventStatusEnum["confirme"] = "Confirm\u00E9";
    EventStatusEnum["en_attente"] = "En attente";
    EventStatusEnum["prepare"] = "Prepar\u00E9";
    EventStatusEnum["termine"] = "Termin\u00E9";
})(EventStatusEnum || (exports.EventStatusEnum = EventStatusEnum = {}));
var EventEtatEnum;
(function (EventEtatEnum) {
    EventEtatEnum["ouvert"] = "Ouvert";
    EventEtatEnum["complet"] = "Complet";
    EventEtatEnum["urgent"] = "Urgent";
})(EventEtatEnum || (exports.EventEtatEnum = EventEtatEnum = {}));
var EventRoleEnum;
(function (EventRoleEnum) {
    EventRoleEnum["coordinateur"] = "Coordinateur";
    EventRoleEnum["serveur"] = "Serveur";
    EventRoleEnum["hotesse"] = "Hotesse";
    EventRoleEnum["accueil"] = "Accueil";
    EventRoleEnum["barman"] = "Barman";
    EventRoleEnum["serviceVip"] = "Service VIP";
})(EventRoleEnum || (exports.EventRoleEnum = EventRoleEnum = {}));
class EventPositionReq {
    role;
    capacity;
}
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(EventRoleEnum), required: true }),
    __metadata("design:type", String)
], EventPositionReq.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 0, default: 1 }),
    __metadata("design:type", Number)
], EventPositionReq.prototype, "capacity", void 0);
let Event = class Event {
    title;
    description;
    location;
    startdate;
    enddate;
    type;
    serveurs;
    guests;
    nbServeur;
    status;
    etat;
    amount;
    positions;
    cover;
    gallery;
    beforeAfter;
};
exports.Event = Event;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nom / titre de l’événement' }),
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Event.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description de l`\'évènement' }),
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Event.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lieu de l\'événement' }),
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Event.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date de debut de l’événement (ISO 8601)' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Event.prototype, "startdate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date de fin de l’événement (ISO 8601)' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Event.prototype, "enddate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: EventTypeEnum }),
    (0, mongoose_1.Prop)({ required: true, enum: Object.values(EventTypeEnum), index: true }),
    __metadata("design:type", String)
], Event.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Liste des serveurs (IDs)', type: [String] }),
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: 'Serveur' }], default: [] }),
    __metadata("design:type", Array)
], Event.prototype, "serveurs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Nombre d'invités" }),
    (0, mongoose_1.Prop)({ type: Number, min: 0, default: 0 }),
    __metadata("design:type", Number)
], Event.prototype, "guests", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Nombre d'invités" }),
    (0, mongoose_1.Prop)({ type: Number, min: 0, default: 0 }),
    __metadata("design:type", Number)
], Event.prototype, "nbServeur", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Status de l'évènement", enum: EventStatusEnum, default: EventStatusEnum.en_attente }),
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(EventStatusEnum), default: EventStatusEnum.en_attente, index: true }),
    __metadata("design:type", String)
], Event.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Etat de l'évènement", enum: EventEtatEnum, default: EventEtatEnum.ouvert }),
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(EventEtatEnum), default: EventEtatEnum.ouvert, index: true }),
    __metadata("design:type", String)
], Event.prototype, "etat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Montant à payer' }),
    (0, mongoose_1.Prop)({ type: Number, min: 0, default: 0 }),
    __metadata("design:type", Number)
], Event.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [EventPositionReq] }),
    (0, mongoose_1.Prop)({ type: [{ role: String, capacity: Number }], default: [] }),
    __metadata("design:type", Array)
], Event.prototype, "positions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'MediaAsset' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Event.prototype, "cover", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: 'MediaAsset' }], default: [] }),
    __metadata("design:type", Array)
], Event.prototype, "gallery", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: 'BeforeAfterPair' }], default: [] }),
    __metadata("design:type", Array)
], Event.prototype, "beforeAfter", void 0);
exports.Event = Event = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Event);
exports.EventSchema = mongoose_1.SchemaFactory.createForClass(Event);
exports.EventSchema.index({ title: 'text', description: 'text', 'client.name': 'text' });
//# sourceMappingURL=event.entity.js.map