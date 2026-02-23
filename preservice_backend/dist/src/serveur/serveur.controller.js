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
exports.ServeurController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const serveur_service_1 = require("./serveur.service");
const create_serveur_dto_1 = require("./dto/create-serveur.dto");
const update_serveur_dto_1 = require("./dto/update-serveur.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const change_password_dto_1 = require("./dto/change-password.dto");
let ServeurController = class ServeurController {
    serveurService;
    constructor(serveurService) {
        this.serveurService = serveurService;
    }
    create(createServeurDto) {
        return this.serveurService.create(createServeurDto);
    }
    findAll() {
        return this.serveurService.findAll();
    }
    serveurStatusesKV() {
        return this.serveurService.serveurStatusesKV();
    }
    findOne(id) {
        return this.serveurService.findOne(id);
    }
    async listAssignedEvents(id) {
        return this.serveurService.listAssignedEvents(id);
    }
    async changePassword(id, body) {
        return this.serveurService.changePassword(id, body);
    }
    update(id, updateServeurDto) {
        return this.serveurService.update(id, updateServeurDto);
    }
    remove(id) {
        return this.serveurService.remove(id);
    }
};
exports.ServeurController = ServeurController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: "Création d'un serveur",
        description: "Ajoute un nouveau serveur (personnel).",
        operationId: 'serveursCreate',
    }),
    (0, swagger_1.ApiBody)({
        type: create_serveur_dto_1.CreateServeurDto,
        examples: {
            default: {
                value: {
                    nom: 'Talom',
                    prenom: 'Odilon',
                    phone: '+21620000000',
                    email: 'odilontalom@gmail.com',
                    mot_passe: 'Passw0rd!',
                    years: 3,
                    skills: ['service de table', 'bar'],
                    status: 'disponible',
                    isActive: true
                }
            }
        }
    }),
    (0, swagger_1.ApiCreatedResponse)({ description: "Serveur créé." }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_serveur_dto_1.CreateServeurDto]),
    __metadata("design:returntype", void 0)
], ServeurController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Liste des serveurs',
        description: 'Retourne tous les serveurs (sans pagination).',
        operationId: 'serveursFindAll',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Liste de tous les serveurs.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServeurController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('meta/serveur-statuses'),
    (0, swagger_1.ApiOperation)({
        summary: 'Statuts de serveur',
        description: "Retourne l'énumération des statuts de serveur sous forme { key, value }.",
        operationId: 'serveursStatusesMeta',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Énum des statuts de serveur (key/value).' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServeurController.prototype, "serveurStatusesKV", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: "Détail d'un serveur",
        description: 'Retourne un serveur par identifiant.',
        operationId: 'serveursFindOne',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Détail du serveur.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServeurController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/assigned-events'),
    (0, swagger_1.ApiOperation)({
        summary: "L'ensemble des evenements assignés d'un serveur",
        operationId: 'listAssignedEvents',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Events assigns du serveur.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin', 'serveur'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServeurController.prototype, "listAssignedEvents", null);
__decorate([
    (0, common_1.Patch)(':id/password'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
        validationError: { target: false, value: false },
    })),
    (0, swagger_1.ApiOperation)({
        summary: "Changer le password d'un serveur",
        operationId: 'changePassword',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Mot de passe du serveur mis à jour.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin', 'serveur'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], ServeurController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: "Mise à jour d'un serveur",
        description: "Met à jour les informations d'un serveur.",
        operationId: 'serveursUpdate',
    }),
    (0, swagger_1.ApiBody)({
        type: update_serveur_dto_1.UpdateServeurDto,
        examples: {
            default: {
                value: {
                    phone: '+21620000111',
                    years: 4,
                    email: 'karim.salah+new@gmail.com.com',
                    mot_passe: 'NewPassw0rd!',
                    skills: ['service de table', 'bar', 'caisse'],
                    status: 'occupe',
                    isActive: true
                }
            }
        }
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Serveur mis à jour.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_serveur_dto_1.UpdateServeurDto]),
    __metadata("design:returntype", void 0)
], ServeurController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: "Suppression d'un serveur",
        description: 'Supprime un serveur par identifiant.',
        operationId: 'serveursDelete',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Serveur supprimé.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServeurController.prototype, "remove", null);
exports.ServeurController = ServeurController = __decorate([
    (0, swagger_1.ApiTags)('Serveurs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('serveur'),
    __metadata("design:paramtypes", [serveur_service_1.ServeurService])
], ServeurController);
//# sourceMappingURL=serveur.controller.js.map