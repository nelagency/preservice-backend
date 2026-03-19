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
const config_1 = require("@nestjs/config");
const public_decorator_1 = require("../common/decorators/public.decorator");
const security_utils_1 = require("../common/security.utils");
const auth_rate_limit_service_1 = require("./auth-rate-limit.service");
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
function getRefreshFromReq(req) {
    const rtCookie = req.cookies;
    const rt = rtCookie?.rt;
    if (rt)
        return rt;
    const body = req.body;
    const bodyToken = body?.refresh_token ?? body?.refreshToken;
    if (typeof bodyToken === 'string' && bodyToken.trim()) {
        return bodyToken.trim();
    }
    const h = req.headers.authorization || '';
    const [type, token] = h.split(' ');
    return type?.toLowerCase() === 'refresh' && token ? token : null;
}
let ServeurAuthController = class ServeurAuthController {
    auth;
    configService;
    authRateLimit;
    constructor(auth, configService, authRateLimit) {
        this.auth = auth;
        this.configService = configService;
        this.authRateLimit = authRateLimit;
    }
    setRefreshCookie(res, token, expiresAt) {
        const secure = String(this.configService.get('cookies.cookieSecure')).toLowerCase() ===
            'true';
        const domain = this.configService.get('cookies.cookieDomain') || undefined;
        res.cookie('rt', token, {
            httpOnly: true,
            secure,
            sameSite: secure ? 'none' : 'lax',
            domain,
            path: '/api',
            expires: expiresAt,
        });
    }
    async login(dto, req, res) {
        const ip = (0, security_utils_1.getClientIp)(req);
        const rateKey = `serveur-login:${ip}:${dto.email.toLowerCase().trim()}`;
        this.authRateLimit.consume(rateKey, {
            limit: 5,
            windowMs: 15 * 60 * 1000,
            message: 'Trop de tentatives de connexion, reessayez plus tard.',
        });
        const meta = { ua: req.headers['user-agent'], ip };
        const result = await this.auth.login(dto.email, dto.mot_passe, meta);
        this.setRefreshCookie(res, result.refresh_token, result.refresh_expires_at);
        this.authRateLimit.reset(rateKey);
        const frontendBase = (this.configService.get('FRONTEND_BASE_URL') ||
            'https://dashboard.nelagency.com').replace(/\/$/, '');
        return { ...result, redirectTo: `${frontendBase}/serveur` };
    }
    me(req) {
        if (req.user?.realm !== 'serveur') {
            throw new common_1.UnauthorizedException('Wrong realm');
        }
        return req.user;
    }
    async refresh(req, res) {
        const old = getRefreshFromReq(req);
        if (!old)
            throw new common_1.UnauthorizedException('Refresh token manquant');
        const ip = (0, security_utils_1.getClientIp)(req);
        this.authRateLimit.consume(`serveur-refresh:${ip}`, {
            limit: 20,
            windowMs: 15 * 60 * 1000,
            message: 'Trop de renouvellements de session, reessayez plus tard.',
        });
        const meta = { ua: req.headers['user-agent'], ip };
        const result = await this.auth.refresh(old, req.user?.sub, meta);
        this.setRefreshCookie(res, result.refresh_token, result.refresh_expires_at);
        return result;
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
            default: {
                value: { email: 'ali.bensalem@example.com', mot_passe: 'Passw0rd!' },
            },
        },
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Authentification serveur reussie.',
        type: ServeurLoginResp,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Identifiants invalides ou compte inactif.',
    }),
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
        summary: 'Profil du serveur connecte',
        description: 'Retourne le payload du JWT (realm=serveur).',
        operationId: 'authServeurMe',
    }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOkResponse)({
        description: 'Profil serveur decode du JWT.',
        type: ServeurAuthUser,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Token manquant/expire ou realm non autorise.',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ServeurAuthController.prototype, "me", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Renouvellement du token serveur',
        operationId: 'authServeurRefresh',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Nouveaux jetons emis.', type: ServeurLoginResp }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ServeurAuthController.prototype, "refresh", null);
exports.ServeurAuthController = ServeurAuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth Serveur'),
    (0, common_1.Controller)('auth-serveur'),
    __metadata("design:paramtypes", [serveur_auth_service_1.ServeurAuthService,
        config_1.ConfigService,
        auth_rate_limit_service_1.AuthRateLimitService])
], ServeurAuthController);
//# sourceMappingURL=serveur-auth.controller.js.map