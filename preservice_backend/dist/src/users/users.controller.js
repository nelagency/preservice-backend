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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    create(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    findAll() {
        return this.usersService.findAll();
    }
    rolesKV() { return this.usersService.rolesKV(); }
    findOne(id) {
        return this.usersService.findOne(id);
    }
    update(id, updateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }
    remove(id) {
        return this.usersService.remove(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: "Création d'un utilisateur",
        description: "Crée un nouvel utilisateur (rôle par défaut: user).",
        operationId: 'usersCreate',
    }),
    (0, swagger_1.ApiBody)({
        type: create_user_dto_1.CreateUserDto,
        examples: {
            default: {
                value: {
                    nom: 'Nadia Test',
                    email: 'nadia@example.com',
                    numero_tel: '+21620000099',
                    adresse: 'Tunis',
                    mot_passe: 'Passw0rd!',
                    role: 'admin'
                }
            }
        }
    }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Utilisateur créé.' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Non autorisé.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Liste des utilisateurs',
        description: 'Retourne tous les utilisateurs (sans pagination).',
        operationId: 'usersFindAll',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Liste des utilisateurs.' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Non autorisé.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('meta/roles'),
    (0, swagger_1.ApiOperation)({
        summary: 'Rôles disponibles',
        description: 'Retourne la liste des rôles ({ key, value }).',
        operationId: 'usersRolesMeta',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Rôles disponibles.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "rolesKV", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: "Détail d'un utilisateur",
        description: "Retourne l'utilisateur par identifiant.",
        operationId: 'usersFindOne',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Utilisateur trouvé.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: "Mise à jour d'un utilisateur",
        description: "Met à jour les informations d'un utilisateur.",
        operationId: 'usersUpdate',
    }),
    (0, swagger_1.ApiBody)({
        type: update_user_dto_1.UpdateUserDto,
        examples: {
            default: {
                value: {
                    nom: 'Nadia Test (MAJ)',
                    adresse: 'Sfax',
                    role: 'superadmin',
                    isActive: true
                }
            }
        }
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Utilisateur mis à jour.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: "Suppression d'un utilisateur",
        description: 'Supprime un utilisateur par identifiant.',
        operationId: 'usersDelete',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Utilisateur supprimé.' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map