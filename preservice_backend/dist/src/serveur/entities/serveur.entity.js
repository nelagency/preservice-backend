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
exports.ServeurSchema = exports.Serveur = exports.ServeurStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const swagger_1 = require("@nestjs/swagger");
var ServeurStatus;
(function (ServeurStatus) {
    ServeurStatus["disponible"] = "Disponible";
    ServeurStatus["occupe"] = "Occup\u00E9";
})(ServeurStatus || (exports.ServeurStatus = ServeurStatus = {}));
let Serveur = class Serveur {
    nom;
    prenom;
    phone;
    email;
    mot_passe;
    years;
    skills;
    status;
    isActive;
    get dateCreation() {
        return this.createdAt;
    }
};
exports.Serveur = Serveur;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Serveur.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Serveur.prototype, "prenom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Serveur.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true, index: true }),
    __metadata("design:type", String)
], Serveur.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, select: false }),
    __metadata("design:type", String)
], Serveur.prototype, "mot_passe", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Nombre d'années d'expérience", minimum: 0 }),
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0 }),
    __metadata("design:type", Number)
], Serveur.prototype, "years", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Serveur.prototype, "skills", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ServeurStatus, default: ServeurStatus.disponible }),
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(ServeurStatus), default: ServeurStatus.disponible, index: true }),
    __metadata("design:type", String)
], Serveur.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'État actif/inactif' }),
    (0, mongoose_1.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], Serveur.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date de création (alias de createdAt)' }),
    __metadata("design:type", Date),
    __metadata("design:paramtypes", [])
], Serveur.prototype, "dateCreation", null);
exports.Serveur = Serveur = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Serveur);
exports.ServeurSchema = mongoose_1.SchemaFactory.createForClass(Serveur);
//# sourceMappingURL=serveur.entity.js.map