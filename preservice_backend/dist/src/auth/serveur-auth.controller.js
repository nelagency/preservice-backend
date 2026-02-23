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
exports.ServeurAuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const serveur_auth_service_1 = require("./serveur-auth.service");
const public_decorator_1 = require("../common/decorators/public.decorator");
class ServeurLoginDto {
    email;
    mot_passe;
}
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ServeurLoginDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], ServeurLoginDto.prototype, "mot_passe", void 0);
class ServeurAuthUser {
    sub;
    email;
    role;
    nom;
    isActive;
    realm;
}
class ServeurLoginResp {
    access_token;
    refresh_token;
    refresh_expires_at;
    user;
}
let ServeurAuthController = class ServeurAuthController {
    auth;
    constructor(auth) {
        this.auth = auth;
    }
    async login(dto, req, res) {
        const meta = { ua: req.headers['user-agent'], ip: req.ip };
        const result = await this.auth.login(dto.email, dto.mot_passe, meta);
        return result;
    }
    async me(req) {
        if (req.user?.realm !== 'serveur') {
            return { error: 'Wrong realm' };
        }
        return req.user;
    }
};
exports.ServeurAuthController = ServeurAuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Connexion serveur',
        description: 'Authentifie un compte serveur par email/mot de passe et renvoie les jetons.',
        operationId: 'authServeurLogin',
    }),
    (0, swagger_1.ApiBody)({
        type: ServeurLoginDto,
        examples: {
            default: { value: { email: 'ali.bensalem@example.com', mot_passe: 'Passw0rd!' } },
        },
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Authentification serveur réussie.',
        type: ServeurLoginResp,
        schema: {
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refresh_expires_at: '2025-11-12T07:34:02.000Z',
                user: {
                    sub: '66f…abc',
                    email: 'ali.bensalem@example.com',
                    role: 'serveur',
                    nom: 'Ali Bensalem',
                    isActive: true,
                    realm: 'serveur',
                },
            },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Identifiants invalides ou compte inactif.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Erreur serveur.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ServeurLoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ServeurAuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({
        summary: 'Profil du serveur connecté',
        description: 'Retourne le payload du JWT (realm=serveur).',
        operationId: 'authServeurMe',
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOkResponse)({
        description: 'Profil serveur (décodé du JWT).',
        type: ServeurAuthUser,
        schema: {
            example: {
                sub: '66f…abc',
                email: 'ali.bensalem@example.com',
                role: 'serveur',
                nom: 'Ali Bensalem',
                isActive: true,
                realm: 'serveur',
            },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Token manquant/expiré ou realm non autorisé.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ServeurAuthController.prototype, "me", null);
exports.ServeurAuthController = ServeurAuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth Serveur'),
    (0, common_1.Controller)('auth-serveur'),
    __metadata("design:paramtypes", [serveur_auth_service_1.ServeurAuthService])
], ServeurAuthController);
//# sourceMappingURL=serveur-auth.controller.js.map