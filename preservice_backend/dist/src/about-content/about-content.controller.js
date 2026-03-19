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
exports.AboutContentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const about_content_service_1 = require("./about-content.service");
const update_about_content_dto_1 = require("./dto/update-about-content.dto");
let AboutContentController = class AboutContentController {
    aboutContentService;
    constructor(aboutContentService) {
        this.aboutContentService = aboutContentService;
    }
    getContent() {
        return this.aboutContentService.getContent();
    }
    updateContent(dto) {
        return this.aboutContentService.updateContent(dto);
    }
};
exports.AboutContentController = AboutContentController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Récupérer le contenu de la page À propos',
        description: 'Retourne la vision, histoire, valeurs, images fondatrice et sections dynamiques.',
        operationId: 'aboutContentGet',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Contenu À propos.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AboutContentController.prototype, "getContent", null);
__decorate([
    (0, common_1.Patch)(),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Modifier le contenu de la page À propos',
        description: 'Met à jour les blocs dynamiques visibles dans la page À propos.',
        operationId: 'aboutContentUpdate',
    }),
    (0, swagger_1.ApiBody)({ type: update_about_content_dto_1.UpdateAboutContentDto }),
    (0, swagger_1.ApiOkResponse)({ description: 'Contenu À propos mis à jour.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_about_content_dto_1.UpdateAboutContentDto]),
    __metadata("design:returntype", void 0)
], AboutContentController.prototype, "updateContent", null);
exports.AboutContentController = AboutContentController = __decorate([
    (0, swagger_1.ApiTags)('About Content'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('about-content'),
    __metadata("design:paramtypes", [about_content_service_1.AboutContentService])
], AboutContentController);
//# sourceMappingURL=about-content.controller.js.map