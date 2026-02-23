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
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const media_service_1 = require("./media.service");
const media_dto_1 = require("./dto/media.dto");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
let MediaController = class MediaController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    presignR2(dto) {
        return this.svc.requestR2Presign({ filename: dto.filename, contentType: dto.contentType, eventId: dto.eventId });
    }
    finalizeR2(dto) {
        return this.svc.finalizeR2Upload(dto);
    }
    streamToken() {
        return this.svc.createStreamDirectUpload();
    }
    finalizeStream(dto) {
        return this.svc.finalizeStreamUpload(dto);
    }
    approve(id, dto) {
        return this.svc.approveMedia(id, dto.approved);
    }
    listByEvent(eventId) {
        return this.svc.listByEvent(eventId);
    }
    createPair(dto) {
        return this.svc.createBeforeAfter(dto);
    }
    listPairs(eventId) {
        return this.svc.listPairsByEvent(eventId);
    }
    remove(id) {
        return this.svc.deleteAsset(id);
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('r2/presign'),
    (0, swagger_1.ApiOperation)({ summary: 'Demander une URL présignée (PUT) pour uploader une image vers R2' }),
    (0, swagger_1.ApiBody)({ type: media_dto_1.RequestR2PresignDto }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin', 'serveur', 'coordinateur'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [media_dto_1.RequestR2PresignDto]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "presignR2", null);
__decorate([
    (0, common_1.Post)('r2/finalize'),
    (0, swagger_1.ApiOperation)({ summary: 'Finaliser un upload R2 (créer MediaAsset public)' }),
    (0, swagger_1.ApiBody)({ type: media_dto_1.FinalizeR2UploadDto }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin', 'serveur', 'coordinateur'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [media_dto_1.FinalizeR2UploadDto]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "finalizeR2", null);
__decorate([
    (0, common_1.Post)('stream/direct-upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtenir une URL d’upload direct Cloudflare Stream' }),
    (0, swagger_1.ApiBody)({ type: media_dto_1.CreateStreamDirectUploadDto }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin', 'serveur', 'coordinateur'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "streamToken", null);
__decorate([
    (0, common_1.Post)('stream/finalize'),
    (0, swagger_1.ApiOperation)({ summary: 'Finaliser un upload Stream (média public)' }),
    (0, swagger_1.ApiBody)({ type: media_dto_1.FinalizeStreamUploadDto }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin', 'serveur', 'coordinateur'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [media_dto_1.FinalizeStreamUploadDto]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "finalizeStream", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approuver / révoquer un média' }),
    (0, swagger_1.ApiBody)({ type: media_dto_1.ApproveMediaDto }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, media_dto_1.ApproveMediaDto]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "approve", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('by-event/:eventId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les médias d’un événement' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Liste des MediaAsset' }),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "listByEvent", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('before-after'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une paire Avant/Après (publique)' }),
    (0, swagger_1.ApiBody)({ type: media_dto_1.CreateBeforeAfterDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [media_dto_1.CreateBeforeAfterDto]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "createPair", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('pairs/by-event/:eventId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les paires Avant/Après d’un événement' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Liste BeforeAfterPair' }),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "listPairs", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un média (R2 ou Stream) et nettoyer les références' }),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "remove", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('Media'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('media'),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaController);
//# sourceMappingURL=media.controller.js.map