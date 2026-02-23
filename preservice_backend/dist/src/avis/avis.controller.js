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
exports.AvisController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const avis_service_1 = require("./avis.service");
const create_avi_dto_1 = require("./dto/create-avi.dto");
const update_avi_dto_1 = require("./dto/update-avi.dto");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let AvisController = class AvisController {
    avisService;
    constructor(avisService) {
        this.avisService = avisService;
    }
    create(createAviDto) {
        return this.avisService.create(createAviDto);
    }
    findAll() {
        return this.avisService.findAll();
    }
    findOne(id) {
        return this.avisService.findOne(id);
    }
    update(id, updateAviDto) {
        return this.avisService.update(id, updateAviDto);
    }
    remove(id) {
        return this.avisService.remove(id);
    }
};
exports.AvisController = AvisController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: "Création d'un avis",
        description: "Crée un nouvel avis pour un événement par un client.",
        operationId: 'avisCreate',
    }),
    (0, swagger_1.ApiBody)({
        type: create_avi_dto_1.CreateAviDto,
        examples: {
            default: {
                value: {
                    note: 5,
                    commentaire: "Parfait, service impeccable.",
                    client: "6653fe1c2b8a0c0f5e2c1a11",
                    event: "6653ff7a2b8a0c0f5e2c1a22",
                    etat: true
                }
            }
        }
    }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Avis créé.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_avi_dto_1.CreateAviDto]),
    __metadata("design:returntype", void 0)
], AvisController.prototype, "create", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Liste des avis',
        description: 'Retourne tous les avis (sans pagination).',
        operationId: 'avisFindAll',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Tous les avis.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AvisController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: "Détail d'un avis",
        description: "Retourne un avis par identifiant.",
        operationId: 'avisFindOne',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Détail de l’avis.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AvisController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: "Mise à jour d'un avis",
        description: "Met à jour un avis existant.",
        operationId: 'avisUpdate',
    }),
    (0, swagger_1.ApiBody)({
        type: update_avi_dto_1.UpdateAviDto,
        examples: {
            default: {
                value: {
                    note: 4,
                    commentaire: "Très bien, quelques retards.",
                    etat: true
                }
            }
        }
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Avis mis à jour.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_avi_dto_1.UpdateAviDto]),
    __metadata("design:returntype", void 0)
], AvisController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: "Suppression d'un avis",
        description: 'Supprime un avis par identifiant.',
        operationId: 'avisDelete',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Avis supprimé.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AvisController.prototype, "remove", null);
exports.AvisController = AvisController = __decorate([
    (0, swagger_1.ApiTags)('Avis'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('avis'),
    __metadata("design:paramtypes", [avis_service_1.AvisService])
], AvisController);
//# sourceMappingURL=avis.controller.js.map