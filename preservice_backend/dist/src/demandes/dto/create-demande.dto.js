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
exports.CreateDemandeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const event_entity_1 = require("../../events/entities/event.entity");
const demande_entity_1 = require("../entities/demande.entity");
class CreateDemandeDto {
    client;
    type;
    date_proposee;
    nb_serveurs;
    status;
}
exports.CreateDemandeDto = CreateDemandeDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateDemandeDto.prototype, "client", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: event_entity_1.EventTypeEnum }),
    (0, class_validator_1.IsEnum)(event_entity_1.EventTypeEnum),
    __metadata("design:type", String)
], CreateDemandeDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDemandeDto.prototype, "date_proposee", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDemandeDto.prototype, "nb_serveurs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: demande_entity_1.DemandeStatusEnum }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(demande_entity_1.DemandeStatusEnum),
    __metadata("design:type", String)
], CreateDemandeDto.prototype, "status", void 0);
//# sourceMappingURL=create-demande.dto.js.map