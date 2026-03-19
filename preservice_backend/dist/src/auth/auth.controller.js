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
var AuthController_1;
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
const user_entity_1 = require("../users/entities/user.entity");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const two_factor_service_1 = require("./two-factor.service");
const admin_audit_log_service_1 = require("./admin-audit-log.service");
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
    mot_de_passe;
    adresse;
    role;
    telephone;
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
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "numero_tel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], RegisterDto.prototype, "mot_passe", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], RegisterDto.prototype, "mot_de_passe", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "adresse", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "telephone", void 0);
class ForgotPasswordDto {
    email;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
class ResetPasswordDto {
    token;
    new_password;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "new_password", void 0);
class TwoFactorCodeDto {
    code;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TwoFactorCodeDto.prototype, "code", void 0);
class VerifyTwoFactorLoginDto extends TwoFactorCodeDto {
    twoFactorToken;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyTwoFactorLoginDto.prototype, "twoFactorToken", void 0);
function getBearer(req) {
    const h = req.headers.authorization || '';
    const [type, token] = h.split(' ');
    return type?.toLowerCase() === 'bearer' && token ? token : null;
}
function getRefreshFromReq(req) {
    const rtCookie = req.cookies;
    const rt = rtCookie?.rt;
    if (rt)
        return rt;
    const body = req.body;
    const bodyToken = body?.refresh_token ?? body?.refreshToken;
    if (typeof bodyToken === 'string' && bodyToken.trim())
        return bodyToken.trim();
    const h = req.headers.authorization || '';
    const [type, token] = h.split(' ');
    return type?.toLowerCase() === 'refresh' && token ? token : null;
}
function normalizeRole(input) {
    if (!input)
        return undefined;
    const role = input.trim().toLowerCase();
    if (role === 'client' || role === 'utilisateur' || role === 'user')
        return user_entity_1.UserRole.user;
    if (role === 'admin')
        return user_entity_1.UserRole.admin;
    if (role === 'superadmin' || role === 'super-admin')
        return user_entity_1.UserRole.superadmin;
    return undefined;
}
let AuthController = AuthController_1 = class AuthController {
    configService;
    auth;
    blacklist;
    rts;
    twoFactor;
    adminAuditLogs;
    logger = new common_1.Logger(AuthController_1.name);
    constructor(configService, auth, blacklist, rts, twoFactor, adminAuditLogs) {
        this.configService = configService;
        this.auth = auth;
        this.blacklist = blacklist;
        this.rts = rts;
        this.twoFactor = twoFactor;
        this.adminAuditLogs = adminAuditLogs;
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
            path: '/api/auth',
            expires: expiresAt,
        });
    }
    clearRefreshCookie(res) {
        const secure = String(this.configService.get('cookies.cookieSecure')).toLowerCase() ===
            'true';
        const domain = this.configService.get('cookies.cookieDomain') || undefined;
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
        let userForLogin;
        try {
            userForLogin = await this.auth.validateUser(dto.email, dto.mot_passe);
        }
        catch (error) {
            await this.adminAuditLogs.record({
                email: dto.email,
                event: 'admin_login_attempt',
                status: 'failure',
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                metadata: { reason: 'invalid_credentials' },
            });
            throw error;
        }
        if (this.twoFactor.requiresTwoFactor(userForLogin)) {
            return this.twoFactor.createLoginChallenge({
                _id: userForLogin._id,
                email: userForLogin.email,
                role: userForLogin.role,
            }, meta);
        }
        const result = await this.auth.login(dto.email, dto.mot_passe, meta);
        const frontendBase = (this.configService.get('FRONTEND_BASE_URL') ||
            'https://dashboard.nelagency.com').replace(/\/$/, '');
        this.setRefreshCookie(res, result.refresh_token, result.refresh_expires_at);
        return { ...result, redirectTo: `${frontendBase}/dashboard` };
    }
    async verifyTwoFactorLogin(dto, req, res) {
        const meta = { ua: req.headers['user-agent'], ip: req.ip };
        const challenge = await this.twoFactor.verifyLoginChallenge(dto.twoFactorToken, dto.code, meta);
        const result = await this.auth.completeTwoFactorLogin(challenge.userId, meta);
        this.setRefreshCookie(res, result.refresh_token, result.refresh_expires_at);
        return { ...result, redirectTo: `${this.configService.get('FRONTEND_BASE_URL') || 'https://dashboard.nelagency.com'}/dashboard` };
    }
    async register(dto, req, res) {
        const meta = { ua: req.headers['user-agent'], ip: req.ip };
        const mot_passe = dto.mot_passe ?? dto.mot_de_passe;
        const numero_tel = dto.numero_tel ?? dto.telephone;
        const role = normalizeRole(dto.role);
        if (!mot_passe || mot_passe.length < 6) {
            throw new common_1.BadRequestException('mot_passe must be a string with minimum length of 6');
        }
        if (!numero_tel || typeof numero_tel !== 'string') {
            throw new common_1.BadRequestException('numero_tel must be a string');
        }
        if (role && role !== user_entity_1.UserRole.user) {
            throw new common_1.BadRequestException('Public register cannot set admin or superadmin role');
        }
        const payload = {
            nom: dto.nom,
            email: dto.email,
            numero_tel,
            adresse: dto.adresse,
            mot_passe,
            role: user_entity_1.UserRole.user,
        };
        const result = await this.auth.register(payload, meta);
        const frontendBase = (this.configService.get('FRONTEND_BASE_URL') ||
            'https://dashboard.nelagency.com').replace(/\/$/, '');
        this.setRefreshCookie(res, result.refresh_token, result.refresh_expires_at);
        return { ...result, redirectTo: `${frontendBase}/dashboard` };
    }
    me(req) {
        return req.user;
    }
    async refresh(req, res) {
        const old = getRefreshFromReq(req);
        if (!old)
            throw new common_1.UnauthorizedException('Refresh token manquant');
        const meta = { ua: req.headers['user-agent'], ip: req.ip };
        const { access_token, user, refresh_token, refresh_expires_at } = await this.auth.refresh(old, req.user?.sub, meta);
        this.setRefreshCookie(res, refresh_token, refresh_expires_at);
        return { user, access_token, refresh_token, refresh_expires_at };
    }
    async forgotPassword(dto) {
        return this.auth.requestPasswordReset(dto.email);
    }
    async resetPassword(dto) {
        return this.auth.resetPassword(dto.token, dto.new_password);
    }
    async twoFactorStatus(req) {
        if (!req.user?.sub)
            throw new common_1.UnauthorizedException('Utilisateur introuvable');
        return this.twoFactor.getStatus(req.user.sub);
    }
    async twoFactorSetup(req) {
        if (!req.user?.sub)
            throw new common_1.UnauthorizedException('Utilisateur introuvable');
        return this.twoFactor.beginSetup(req.user.sub, {
            ua: req.headers['user-agent'],
            ip: req.ip,
        });
    }
    async twoFactorEnable(req, dto) {
        if (!req.user?.sub)
            throw new common_1.UnauthorizedException('Utilisateur introuvable');
        return this.twoFactor.enable(req.user.sub, dto.code, {
            ua: req.headers['user-agent'],
            ip: req.ip,
        });
    }
    async twoFactorDisable(req, dto) {
        if (!req.user?.sub)
            throw new common_1.UnauthorizedException('Utilisateur introuvable');
        return this.twoFactor.disable(req.user.sub, dto.code, {
            ua: req.headers['user-agent'],
            ip: req.ip,
        });
    }
    async getAdminAuditLogs(req) {
        if (!req.user?.sub)
            throw new common_1.UnauthorizedException('Utilisateur introuvable');
        const raw = req.query?.limit;
        const limit = raw ? Number(raw) : 50;
        return this.adminAuditLogs.list(limit);
    }
    async logout(req, res) {
        const token = getBearer(req);
        const exp = req.user?.exp;
        const sub = req.user?.sub;
        if (token && exp) {
            await this.blacklist.add(token, sub ?? null, exp);
        }
        const rt = getRefreshFromReq(req);
        if (rt)
            await this.rts.revoke(rt);
        this.clearRefreshCookie(res);
        if (req.user?.role === 'admin' || req.user?.role === 'superadmin') {
            this.logger.log(JSON.stringify({
                type: 'admin_auth',
                event: 'logout',
                userId: req.user.sub,
                role: req.user.role,
                ip: req.ip,
                at: new Date().toISOString(),
            }));
        }
        return { success: true };
    }
    async logoutAll(req, res) {
        const sub = req.user?.sub;
        if (sub)
            await this.rts.revokeAllForUser(sub);
        this.clearRefreshCookie(res);
        if (req.user?.role === 'admin' || req.user?.role === 'superadmin') {
            this.logger.log(JSON.stringify({
                type: 'admin_auth',
                event: 'logout_all',
                userId: req.user.sub,
                role: req.user.role,
                ip: req.ip,
                at: new Date().toISOString(),
            }));
        }
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
        description: 'Authentifie l’utilisateur et retourne un jeton JWT.',
        operationId: 'authLogin',
    }),
    (0, swagger_1.ApiBody)({
        type: LoginDto,
        examples: {
            default: {
                value: { email: 'ali.bensalem@example.com', mot_passe: 'Passw0rd!' },
            },
        },
    }),
    (0, swagger_1.ApiOkResponse)({ description: 'Authentification réussie (JWT retourné).' }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Identifiants invalides ou compte inactif.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('2fa/verify-login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Validation du code 2FA au login admin',
        operationId: 'authVerifyTwoFactorLogin',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [VerifyTwoFactorLoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyTwoFactorLogin", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({
        summary: "Inscription d'un utilisateur",
        description: 'Crée un nouvel utilisateur et renvoie un JWT.',
        operationId: 'authRegister',
    }),
    (0, swagger_1.ApiBody)({
        type: RegisterDto,
        examples: {
            default: {
                value: {
                    nom: 'Nadia Test',
                    email: 'nadia@example.com',
                    numero_tel: '+21620000099',
                    mot_passe: 'Passw0rd!',
                },
            },
        },
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Utilisateur créé et connecté (JWT retourné).',
    }),
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
    (0, swagger_1.ApiOperation)({
        summary: 'Renouvellement du token',
        operationId: 'authRefresh',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Demande de reinitialisation mot de passe',
        operationId: 'authForgotPassword',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Reinitialisation mot de passe par token',
        operationId: 'authResetPassword',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Get)('2fa/status'),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Statut de la double authentification admin',
        operationId: 'authTwoFactorStatus',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "twoFactorStatus", null);
__decorate([
    (0, common_1.Post)('2fa/setup'),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Initialise la configuration de la double authentification admin',
        operationId: 'authTwoFactorSetup',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "twoFactorSetup", null);
__decorate([
    (0, common_1.Post)('2fa/enable'),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Active la double authentification admin',
        operationId: 'authTwoFactorEnable',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, TwoFactorCodeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "twoFactorEnable", null);
__decorate([
    (0, common_1.Post)('2fa/disable'),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Désactive la double authentification admin',
        operationId: 'authTwoFactorDisable',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, TwoFactorCodeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "twoFactorDisable", null);
__decorate([
    (0, common_1.Get)('admin-audit-logs'),
    (0, roles_decorator_1.Roles)('admin', 'superadmin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiOperation)({
        summary: 'Retourne les derniers logs d audit admin',
        operationId: 'authAdminAuditLogs',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getAdminAuditLogs", null);
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
    (0, swagger_1.ApiOperation)({
        summary: 'Déconnexion de tous les appareils',
        operationId: 'authLogoutAll',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutAll", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        auth_service_1.AuthService,
        token_blacklist_service_1.TokenBlacklistService,
        refresh_tokens_service_1.RefreshTokensService,
        two_factor_service_1.TwoFactorService,
        admin_audit_log_service_1.AdminAuditLogService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map