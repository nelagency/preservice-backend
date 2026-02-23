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
const update_participation_dto_1 = require("./dto/update-participation.dto");
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
    create(createParticipationDto) {
        return this.svc.create(createParticipationDto);
    }
    findOne(id) {
        return this.svc.findOne(+id);
    }
    update(id, dto) {
        return this.svc.update(+id, dto);
    }
    remove(eventId, id) {
        return this.svc.remove(id);
    }
};
exports.ParticipationController = ParticipationController;
__decorate([
    (0, common_1.Post)('apply'),
    (0, swagger_1.ApiOperation)({
        summary: 'Soumettre une candidature',
        description: "Un serveur se porte candidat pour participer à l'évènement.",
        operationId: 'participationsApply',
    }),
    (0, swagger_1.ApiParam)({ name: 'eventId', description: "Identifiant de l'évènement" }),
    (0, swagger_1.ApiBody)({
        type: create_participation_dto_1.ApplyDto,
        examples: {
            default: {
                value: {
                    serveurId: '66f0b2a4b3cfae0012abcd34',
                    notes: 'Disponible en soirée, 5 ans d’expérience.',
                },
            },
        },
    }),
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
        description: 'Met à jour le statut de candidature (approved / rejected).',
        operationId: 'participationsApprove',
    }),
    (0, swagger_1.ApiParam)({ name: 'eventId', description: "Identifiant de l'évènement" }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant de la participation' }),
    (0, swagger_1.ApiBody)({
        type: create_participation_dto_1.ApproveDto,
        examples: {
            approve: { value: { status: 'approved' } },
            reject: { value: { status: 'rejected' } },
        },
    }),
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
        description: "Assigne un rôle (poste) au serveur pour l'évènement, avec statut d'affectation (provisional/confirmed).",
        operationId: 'participationsAssign',
    }),
    (0, swagger_1.ApiParam)({ name: 'eventId', description: "Identifiant de l'évènement" }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant de la participation' }),
    (0, swagger_1.ApiBody)({
        type: create_participation_dto_1.AssignDto,
        examples: {
            default: {
                value: {
                    role: 'Serveur',
                    assignmentStatus: 'provisional',
                },
            },
        },
    }),
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
        description: "Remplace l'ensemble des affectations d’un évènement à partir d’un mapping (id serveur → rôle). Idéal pour le drag & drop.",
        operationId: 'participationsBulkAssign',
    }),
    (0, swagger_1.ApiParam)({ name: 'eventId', description: "Identifiant de l'évènement" }),
    (0, swagger_1.ApiBody)({
        type: create_participation_dto_1.BulkAssignDto,
        examples: {
            default: {
                value: {
                    assignments: [
                        { serveurId: '66f0b2a4b3cfae0012abcd34', role: 'Coordinateur' },
                        { serveurId: '66f0b2a4b3cfae0012abcd35', role: 'Serveur', assignmentStatus: 'provisional' },
                        { serveurId: '66f0b2a4b3cfae0012abcd36', role: 'Hotesse' },
                    ],
                },
            },
        },
    }),
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
        description: 'Retourne { confirmed, pending, unassigned, total } pour alimenter le panneau de validation.',
        operationId: 'participationsKpis',
    }),
    (0, swagger_1.ApiParam)({ name: 'eventId', description: "Identifiant de l'évènement" }),
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
        description: "Passe toutes les affectations 'provisional' à 'confirmed' pour l'évènement.",
        operationId: 'participationsConfirmAll',
    }),
    (0, swagger_1.ApiParam)({ name: 'eventId', description: "Identifiant de l'évènement" }),
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
        summary: 'Lister les participations d’un évènement',
        description: 'Filtre par :eventId (pending/approved/rejected selon implémentation service).',
    }),
    (0, swagger_1.ApiParam)({ name: 'eventId', description: 'Identifiant de levenement' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Evenement retourné.' }),
    (0, roles_decorator_1.Roles)('serveur', 'admin', 'superadmin'),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParticipationController.prototype, "findByEvent", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':serveurId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister les participations d’un serveur',
        description: 'Filtre par :serveurId (pending/approved/rejected selon implémentation service).',
    }),
    (0, swagger_1.ApiParam)({ name: 'serveurId', description: 'Identifiant du serveur' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Partricipations du serveur retournées.' }),
    __param(0, (0, common_1.Param)('serveurId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParticipationController.prototype, "findByServeur", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Créer une participation (CRUD)',
        description: 'Point d’entrée générique si besoin (utiliser plutôt /apply dans le flux standard).',
        operationId: 'participationsCreate',
    }),
    (0, swagger_1.ApiBody)({ type: create_participation_dto_1.CreateParticipationDto }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Participation créée.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_participation_dto_1.CreateParticipationDto]),
    __metadata("design:returntype", void 0)
], ParticipationController.prototype, "create", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Détail participation (CRUD)',
        description: 'Retourne une participation par identifiant.',
        operationId: 'participationsFindOne',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant de la participation' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Participation retournée.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ParticipationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Mise à jour participation (CRUD)',
        description: 'Met à jour une participation.',
        operationId: 'participationsUpdate',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant de la participation' }),
    (0, swagger_1.ApiBody)({ type: update_participation_dto_1.UpdateParticipationDto }),
    (0, swagger_1.ApiOkResponse)({ description: 'Participation mise à jour.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_participation_dto_1.UpdateParticipationDto]),
    __metadata("design:returntype", void 0)
], ParticipationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Suppression participation (CRUD)',
        description: 'Supprime une participation.',
        operationId: 'participationsRemove',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant de la participation' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Participation supprimée.' }),
    (0, roles_decorator_1.Roles)('serveur', 'admin', 'superadmin'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ParticipationController.prototype, "remove", null);
exports.ParticipationController = ParticipationController = __decorate([
    (0, swagger_1.ApiTags)('Participations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('events/:eventId/participations'),
    __metadata("design:paramtypes", [participation_service_1.ParticipationService])
], ParticipationController);
//# sourceMappingURL=participation.controller.js.map