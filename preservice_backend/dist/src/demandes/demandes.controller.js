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
exports.DemandesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const demandes_service_1 = require("./demandes.service");
const create_demande_dto_1 = require("./dto/create-demande.dto");
const update_demande_dto_1 = require("./dto/update-demande.dto");
const public_decorator_1 = require("../common/decorators/public.decorator");
let DemandesController = class DemandesController {
    demandesService;
    constructor(demandesService) {
        this.demandesService = demandesService;
    }
    create(createDemandeDto) {
        return this.demandesService.create(createDemandeDto);
    }
    findAll() {
        return this.demandesService.findAll();
    }
    typesKV() { return this.demandesService.typesKV(); }
    statusesKV() { return this.demandesService.statusesKV(); }
    findOne(id) {
        return this.demandesService.findOne(id);
    }
    update(id, updateDemandeDto) {
        return this.demandesService.update(id, updateDemandeDto);
    }
    remove(id) {
        return this.demandesService.remove(id);
    }
};
exports.DemandesController = DemandesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: "Création d'une demande",
        description: "Crée une nouvelle demande d'événement par un client.",
        operationId: 'demandesCreate',
    }),
    (0, swagger_1.ApiBody)({
        type: create_demande_dto_1.CreateDemandeDto,
        examples: {
            default: {
                value: {
                    client: "665400000000000000000001",
                    type: "Mariages",
                    date_proposee: "2025-12-20T17:00:00.000Z",
                    nb_serveurs: 5,
                    status: "en_attente"
                }
            }
        }
    }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Demande créée.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_demande_dto_1.CreateDemandeDto]),
    __metadata("design:returntype", void 0)
], DemandesController.prototype, "create", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Liste des demandes',
        description: 'Retourne toutes les demandes (sans pagination).',
        operationId: 'demandesFindAll',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Toutes les demandes.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DemandesController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('meta/types'),
    (0, swagger_1.ApiOperation)({
        summary: 'Types de demande',
        description: 'Retourne les types possibles de demande sous forme { key, value }.',
        operationId: 'demandesTypesMeta',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Types de demande (clé/valeur).' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DemandesController.prototype, "typesKV", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('meta/types'),
    (0, swagger_1.ApiOperation)({
        summary: 'Statuts de demande',
        description: 'Retourne les statuts possibles de demande sous forme { key, value }.',
        operationId: 'demandesStatutMeta',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Types de demande (clé/valeur).' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DemandesController.prototype, "statusesKV", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: "Détail d'une demande",
        description: "Retourne une demande par identifiant.",
        operationId: 'demandesFindOne',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Détail de la demande.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DemandesController.prototype, "findOne", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: "Mise à jour d'une demande",
        description: "Met à jour les champs d'une demande existante.",
        operationId: 'demandesUpdate',
    }),
    (0, swagger_1.ApiBody)({
        type: update_demande_dto_1.UpdateDemandeDto,
        examples: {
            statusOnly: { value: { status: "confirme" } },
            full: {
                value: {
                    type: "Buffets",
                    date_proposee: "2025-12-22T19:00:00.000Z",
                    nb_serveurs: 7,
                    status: "en_attente"
                }
            }
        }
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Demande mise à jour.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_demande_dto_1.UpdateDemandeDto]),
    __metadata("design:returntype", void 0)
], DemandesController.prototype, "update", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: "Suppression d'une demande",
        description: 'Supprime une demande par identifiant.',
        operationId: 'demandesDelete',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Demande supprimée.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DemandesController.prototype, "remove", null);
exports.DemandesController = DemandesController = __decorate([
    (0, swagger_1.ApiTags)('Demandes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('demandes'),
    __metadata("design:paramtypes", [demandes_service_1.DemandesService])
], DemandesController);
//# sourceMappingURL=demandes.controller.js.map