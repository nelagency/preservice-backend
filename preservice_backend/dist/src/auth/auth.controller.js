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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const public_decorator_1 = require("../common/decorators/public.decorator");
const class_validator_1 = require("class-validator");
const token_blacklist_service_1 = require("./token-blacklist.service");
const refresh_tokens_service_1 = require("./refresh-tokens.service");
const config_1 = require("@nestjs/config");
class LoginDto {
    email;
    mot_passe;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], LoginDto.prototype, "mot_passe", void 0);
class RegisterDto {
    nom;
    email;
    numero_tel;
    mot_passe;
    adresse;
    role;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "numero_tel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], RegisterDto.prototype, "mot_passe", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "adresse", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);
function getBearer(req) {
    const h = req?.headers?.authorization || '';
    const [type, token] = h.split(' ');
    return type?.toLowerCase() === 'bearer' && token ? token : null;
}
function getRefreshFromReq(req) {
    const rt = req?.cookies?.rt;
    if (rt)
        return rt;
    const h = req?.headers?.authorization || '';
    const [type, token] = h.split(' ');
    return type?.toLowerCase() === 'refresh' && token ? token : null;
}
let AuthController = class AuthController {
    configService;
    auth;
    blacklist;
    rts;
    constructor(configService, auth, blacklist, rts) {
        this.configService = configService;
        this.auth = auth;
        this.blacklist = blacklist;
        this.rts = rts;
    }
    setRefreshCookie(res, token, expiresAt) {
        const secure = String(this.configService.get('auth.cookieSecure')).toLowerCase() === 'true';
        const domain = this.configService.get('auth.cookieDomain') || undefined;
        res.cookie('rt', token, {
            httpOnly: true,
            secure,
            sameSite: secure ? 'none' : 'lax',
            domain,
            path: '/api/auth',
            expires: expiresAt,
        });
    }
    clearRefreshCookie(res) {
        const secure = String(this.configService.get('auth.cookieSecure')).toLowerCase() === 'true';
        const domain = this.configService.get('auth.cookieDomain') || undefined;
        res.clearCookie('rt', {
            httpOnly: true,
            secure,
            sameSite: secure ? 'none' : 'lax',
            domain,
            path: '/api/auth',
        });
    }
    async login(dto, req, res) {
        const meta = { ua: req.headers['user-agent'], ip: req.ip };
        const result = await this.auth.login(dto.email, dto.mot_passe, meta);
        this.setRefreshCookie(res, result.refresh_token, result.refresh_expires_at);
        return result;
    }
    async register(dto, req, res) {
        const meta = { ua: req.headers['user-agent'], ip: req.ip };
        const result = await this.auth.register(dto, meta);
        this.setRefreshCookie(res, result.refresh_token, result.refresh_expires_at);
        return result;
    }
    me(req) { return req.user; }
    async refresh(req, res) {
        const old = getRefreshFromReq(req);
        if (!old)
            return { error: 'Refresh token manquant' };
        const meta = { ua: req.headers['user-agent'], ip: req.ip };
        const { access_token, user, refresh_token, refresh_expires_at } = await this.auth.refresh(old, req?.user?.sub, meta);
        this.setRefreshCookie(res, refresh_token, refresh_expires_at);
        return { user, access_token, refresh_token, refresh_expires_at };
    }
    async logout(req, res) {
        const token = getBearer(req);
        const exp = req?.user?.exp;
        const sub = req?.user?.sub;
        if (token && exp) {
            await this.blacklist.add(token, sub ?? null, exp);
        }
        const rt = getRefreshFromReq(req);
        if (rt)
            await this.rts.revoke(rt);
        this.clearRefreshCookie(res);
        return { success: true };
    }
    async logoutAll(req, res) {
        const sub = req?.user?.sub;
        if (sub)
            await this.rts.revokeAllForUser(sub);
        this.clearRefreshCookie(res);
        return { success: true };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: "Connexion d'un utilisateur",
        description: "Authentifie l’utilisateur et retourne un jeton JWT.",
        operationId: 'authLogin',
    }),
    (0, swagger_1.ApiBody)({
        type: LoginDto,
        examples: {
            default: { value: { email: 'ali.bensalem@example.com', mot_passe: 'Passw0rd!' } }
        }
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Authentification réussie (JWT retourné).' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Identifiants invalides ou compte inactif.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({
        summary: "Inscription d'un utilisateur",
        description: "Crée un nouvel utilisateur et renvoie un JWT.",
        operationId: 'authRegister',
    }),
    (0, swagger_1.ApiBody)({
        type: RegisterDto,
        examples: {
            default: { value: { nom: 'Nadia Test', email: 'nadia@example.com', numero_tel: '+21620000099', mot_passe: 'Passw0rd!' } }
        }
    }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Utilisateur créé et connecté (JWT retourné).' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({
        summary: 'Profil de l’utilisateur connecté',
        description: 'Retourne le payload du JWT (sub, email, role, etc.).',
        operationId: 'authMe',
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Profil récupéré.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Renouvellement du token', operationId: 'authRefresh' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Déconnexion', operationId: 'authLogout' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('logout-all'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Déconnexion de tous les appareils', operationId: 'authLogoutAll' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutAll", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        auth_service_1.AuthService,
        token_blacklist_service_1.TokenBlacklistService,
        refresh_tokens_service_1.RefreshTokensService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map