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
exports.CreateParticipationDto = exports.BulkAssignDto = exports.BulkAssignItem = exports.AssignDto = exports.ApproveDto = exports.ApplyDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const participation_entity_1 = require("../entities/participation.entity");
const event_entity_1 = require("../../events/entities/event.entity");
class ApplyDto {
    serveurId;
    notes;
}
exports.ApplyDto = ApplyDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], ApplyDto.prototype, "serveurId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplyDto.prototype, "notes", void 0);
class ApproveDto {
    status;
}
exports.ApproveDto = ApproveDto;
__decorate([
    (0, class_validator_1.IsEnum)(participation_entity_1.CandidatureStatus),
    __metadata("design:type", String)
], ApproveDto.prototype, "status", void 0);
class AssignDto {
    role;
    assignmentStatus;
}
exports.AssignDto = AssignDto;
__decorate([
    (0, class_validator_1.IsEnum)(event_entity_1.EventRoleEnum),
    __metadata("design:type", String)
], AssignDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(participation_entity_1.AssignmentStatus),
    __metadata("design:type", String)
], AssignDto.prototype, "assignmentStatus", void 0);
class BulkAssignItem {
    serveurId;
    role;
    assignmentStatus;
}
exports.BulkAssignItem = BulkAssignItem;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], BulkAssignItem.prototype, "serveurId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(event_entity_1.EventRoleEnum),
    __metadata("design:type", String)
], BulkAssignItem.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(participation_entity_1.AssignmentStatus),
    __metadata("design:type", String)
], BulkAssignItem.prototype, "assignmentStatus", void 0);
class BulkAssignDto {
    assignments;
}
exports.BulkAssignDto = BulkAssignDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(0),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BulkAssignItem),
    __metadata("design:type", Array)
], BulkAssignDto.prototype, "assignments", void 0);
class CreateParticipationDto {
}
exports.CreateParticipationDto = CreateParticipationDto;
//# sourceMappingURL=create-participation.dto.js.map