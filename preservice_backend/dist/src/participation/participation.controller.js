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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const participation_service_1 = require("./participation.service");
const create_participation_dto_1 = require("./dto/create-participation.dto");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let ParticipationController = class ParticipationController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    apply(eventId, dto) {
        return this.svc.apply(eventId, dto.serveurId, dto.notes);
    }
    approve(eventId, id, dto, req) {
        return this.svc.setCandidatureStatusEvent(eventId, id, dto.status, req.user.sub);
    }
    assign(eventId, id, dto) {
        return this.svc.assignRole(eventId, id, dto);
    }
    bulk(eventId, dto) {
        return this.svc.bulkReplaceAssignments(eventId, dto);
    }
    kpis(eventId) {
        return this.svc.kpis(eventId);
    }
    confirmAll(eventId) {
        return this.svc.confirmAll(eventId);
    }
    findByEvent(eventId) {
        return this.svc.findByEvent(eventId);
    }
    findByServeur(serveurId) {
        return this.svc.findByServeur(serveurId);
    }
};
exports.ParticipationController = ParticipationController;
__decorate([
    (0, common_1.Post)('apply'),
    (0, swagger_1.ApiOperation)({
        summary: 'Soumettre une candidature',
        operationId: 'participationsApply',
    }),
    (0, swagger_1.ApiParam)({ name: 'eventId', description: "Identifiant de l'événement" }),
    (0, swagger_1.ApiBody)({ type: create_participation_dto_1.ApplyDto }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Candidature enregistrée.' }),
    (0, roles_decorator_1.Roles)('serveur', 'admin', 'superadmin'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_participation_dto_1.ApplyDto]),
    __metadata("design:returntype", void 0)
], ParticipationController.prototype, "apply", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, swagger_1.ApiOperation)({
        summary: 'Valider / rejeter une candidature',
        operationId: 'participationsApprove',
    }),
    (0, swagger_1.ApiParam)({ name: 'eventId', description: "Identifiant de l'événement" }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant de la participation' }),
    (0, swagger_1.ApiBody)({ type: create_participation_dto_1.ApproveDto }),
    (0, swagger_1.ApiOkResponse)({ description: 'Candidature mise à jour.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_participation_dto_1.ApproveDto, Object]),
    __metadata("design:returntype", void 0)
], ParticipationController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/assign'),
    (0, swagger_1.ApiOperation)({
        summary: 'Assigner un serveur à un poste',
        operationId: 'participationsAssign',
    }),
    (0, swagger_1.ApiParam)({ name: 'eventId', description: "Identifiant de l'événement" }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant de la participation' }),
    (0, swagger_1.ApiBody)({ type: create_participation_dto_1.AssignDto }),
    (0, swagger_1.ApiOkResponse)({ description: 'Affectation mise à jour.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_participation_dto_1.AssignDto]),
    __metadata("design:returntype", void 0)
], ParticipationController.prototype, "assign", null);
__decorate([
    (0, common_1.Patch)('bulk-assign'),
    (0, swagger_1.ApiOperation)({
        summary: 'Remplacer toutes les affectations (bulk)',
        operationId: 'participationsBulkAssign',
    }),
    (0, swagger_1.ApiParam)({ name: 'eventId', description: "Identifiant de l'événement" }),
    (0, swagger_1.ApiBody)({ type: create_participation_dto_1.BulkAssignDto }),
    (0, swagger_1.ApiOkResponse)({ description: 'Affectations remplacées.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_participation_dto_1.BulkAssignDto]),
    __metadata("design:returntype", void 0)
], ParticipationController.prototype, "bulk", null);
__decorate([
    (0, common_1.Get)('kpis'),
    (0, swagger_1.ApiOperation)({
        summary: 'KPI participations',
        operationId: 'participationsKpis',
    }),
    (0, swagger_1.ApiParam)({ name: 'eventId', description: "Identifiant de l'événement" }),
    (0, swagger_1.ApiOkResponse)({ description: 'KPIs retournés.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParticipationController.prototype, "kpis", null);
__decorate([
    (0, common_1.Patch)('confirm-all'),
    (0, swagger_1.ApiOperation)({
        summary: 'Confirmer toutes les affectations provisoires',
        operationId: 'participationsConfirmAll',
    }),
    (0, swagger_1.ApiParam)({ name: 'eventId', description: "Identifiant de l'événement" }),
    (0, swagger_1.ApiOkResponse)({ description: 'Affectations confirmées.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParticipationController.prototype, "confirmAll", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: "Lister les participations d'un événement",
        operationId: 'participationsFindByEvent',
    }),
    (0, swagger_1.ApiParam)({ name: 'eventId', description: "Identifiant de l'événement" }),
    (0, swagger_1.ApiOkResponse)({ description: "Participations de l'événement." }),
    (0, roles_decorator_1.Roles)('serveur', 'admin', 'superadmin'),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParticipationController.prototype, "findByEvent", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('serveur/:serveurId'),
    (0, swagger_1.ApiOperation)({
        summary: "Lister les participations d'un serveur",
        operationId: 'participationsFindByServeur',
    }),
    (0, swagger_1.ApiParam)({ name: 'serveurId', description: 'Identifiant du serveur' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Participations du serveur retournées.' }),
    __param(0, (0, common_1.Param)('serveurId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParticipationController.prototype, "findByServeur", null);
exports.ParticipationController = ParticipationController = __decorate([
    (0, swagger_1.ApiTags)('Participations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('events/:eventId/participations'),
    __metadata("design:paramtypes", [participation_service_1.ParticipationService])
], ParticipationController);
//# sourceMappingURL=participation.controller.js.map