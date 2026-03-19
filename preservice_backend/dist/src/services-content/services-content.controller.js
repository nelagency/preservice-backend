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
exports.ServicesContentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const create_service_item_dto_1 = require("./dto/create-service-item.dto");
const update_service_item_dto_1 = require("./dto/update-service-item.dto");
const services_content_service_1 = require("./services-content.service");
let ServicesContentController = class ServicesContentController {
    servicesContentService;
    constructor(servicesContentService) {
        this.servicesContentService = servicesContentService;
    }
    findAllPublic() {
        return this.servicesContentService.findAllPublic();
    }
    findAllAdmin() {
        return this.servicesContentService.findAllAdmin();
    }
    create(dto) {
        return this.servicesContentService.create(dto);
    }
    update(id, dto) {
        return this.servicesContentService.update(id, dto);
    }
};
exports.ServicesContentController = ServicesContentController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister les services (public)',
        description: 'Retourne les services actifs affichés sur le site.',
        operationId: 'servicesContentFindAllPublic',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Liste des services actifs.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServicesContentController.prototype, "findAllPublic", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister tous les services (admin)',
        description: 'Retourne tous les services incluant inactifs pour le dashboard.',
        operationId: 'servicesContentFindAllAdmin',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Liste complète des services.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServicesContentController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Ajouter un service',
        description: 'Ajoute un service affichable sur la page Services.',
        operationId: 'servicesContentCreate',
    }),
    (0, swagger_1.ApiBody)({ type: create_service_item_dto_1.CreateServiceItemDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_service_item_dto_1.CreateServiceItemDto]),
    __metadata("design:returntype", void 0)
], ServicesContentController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Modifier un service',
        description: 'Met à jour un service existant.',
        operationId: 'servicesContentUpdate',
    }),
    (0, swagger_1.ApiBody)({ type: update_service_item_dto_1.UpdateServiceItemDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_service_item_dto_1.UpdateServiceItemDto]),
    __metadata("design:returntype", void 0)
], ServicesContentController.prototype, "update", null);
exports.ServicesContentController = ServicesContentController = __decorate([
    (0, swagger_1.ApiTags)('Services Content'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('services'),
    __metadata("design:paramtypes", [services_content_service_1.ServicesContentService])
], ServicesContentController);
//# sourceMappingURL=services-content.controller.js.map