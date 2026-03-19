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
exports.InstagramController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const instagram_service_1 = require("./instagram.service");
const create_instagram_post_dto_1 = require("./dto/create-instagram-post.dto");
const update_instagram_post_dto_1 = require("./dto/update-instagram-post.dto");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let InstagramController = class InstagramController {
    instagramService;
    constructor(instagramService) {
        this.instagramService = instagramService;
    }
    findAll() {
        return this.instagramService.findAll();
    }
    create(dto) {
        return this.instagramService.create(dto);
    }
    update(id, dto) {
        return this.instagramService.update(id, dto);
    }
    remove(id) {
        return this.instagramService.remove(id);
    }
};
exports.InstagramController = InstagramController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Liste des posts Instagram',
        description: 'Retourne les posts Instagram actifs pour affichage frontend.',
        operationId: 'instagramFindAll',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Liste des posts Instagram.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InstagramController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Ajouter un post Instagram',
        description: 'Ajout manuel d un post Instagram (image, texte, date, lien).',
        operationId: 'instagramCreate',
    }),
    (0, swagger_1.ApiBody)({ type: create_instagram_post_dto_1.CreateInstagramPostDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_instagram_post_dto_1.CreateInstagramPostDto]),
    __metadata("design:returntype", void 0)
], InstagramController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Modifier un post Instagram',
        description: 'Met a jour un post Instagram local existant.',
        operationId: 'instagramUpdate',
    }),
    (0, swagger_1.ApiBody)({ type: update_instagram_post_dto_1.UpdateInstagramPostDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_instagram_post_dto_1.UpdateInstagramPostDto]),
    __metadata("design:returntype", void 0)
], InstagramController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Supprimer un post Instagram',
        description: 'Supprime un post Instagram local.',
        operationId: 'instagramDelete',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InstagramController.prototype, "remove", null);
exports.InstagramController = InstagramController = __decorate([
    (0, swagger_1.ApiTags)('Instagram'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('instagram-posts'),
    __metadata("design:paramtypes", [instagram_service_1.InstagramService])
], InstagramController);
//# sourceMappingURL=instagram.controller.js.map