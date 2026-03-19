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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const mongoose_2 = require("mongoose");
const otplib_1 = require("otplib");
const qrcode_1 = __importDefault(require("qrcode"));
const user_entity_1 = require("../users/entities/user.entity");
const admin_audit_log_service_1 = require("./admin-audit-log.service");
const security_utils_1 = require("../common/security.utils");
function toStringValue(value) {
    if (typeof value === 'number')
        return value;
    if (typeof value === 'string' && value.trim())
        return value;
    return undefined;
}
let TwoFactorService = class TwoFactorService {
    configService;
    jwt;
    users;
    auditLogs;
    constructor(configService, jwt, users, auditLogs) {
        this.configService = configService;
        this.jwt = jwt;
        this.users = users;
        this.auditLogs = auditLogs;
    }
    getEncryptionKey() {
        const raw = this.configService.get('TWO_FACTOR_ENCRYPTION_KEY') ||
            this.configService.get('auth.refreshToken') ||
            this.configService.get('auth.accessToken');
        if (!raw) {
            throw new common_1.UnauthorizedException('2FA encryption key is not configured');
        }
        return (0, crypto_1.createHash)('sha256').update(raw).digest();
    }
    encryptSecret(secret) {
        const iv = (0, crypto_1.randomBytes)(12);
        const key = this.getEncryptionKey();
        const cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', key, iv);
        const encrypted = Buffer.concat([
            cipher.update(secret, 'utf8'),
            cipher.final(),
        ]);
        const authTag = cipher.getAuthTag();
        return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
    }
    decryptSecret(secret) {
        if (!secret)
            return '';
        const [ivRaw, authTagRaw, encryptedRaw] = secret.split(':');
        if (!ivRaw || !authTagRaw || !encryptedRaw) {
            throw new common_1.UnauthorizedException('Invalid 2FA secret payload');
        }
        const decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', this.getEncryptionKey(), Buffer.from(ivRaw, 'base64'));
        decipher.setAuthTag(Buffer.from(authTagRaw, 'base64'));
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedRaw, 'base64')),
            decipher.final(),
        ]);
        return decrypted.toString('utf8');
    }
    assertAdminRole(role) {
        if (role !== user_entity_1.UserRole.admin && role !== user_entity_1.UserRole.superadmin) {
            throw new common_1.UnauthorizedException('2FA is reserved for admin accounts');
        }
    }
    sanitizeCode(code) {
        return code.replace(/\s+/g, '').trim();
    }
    async findAdminUserById(userId) {
        const user = await this.users
            .findById(userId)
            .select('+twoFactorSecret +twoFactorTempSecret')
            .lean();
        if (!user)
            throw new common_1.UnauthorizedException('Utilisateur introuvable');
        this.assertAdminRole(user.role);
        return user;
    }
    async getStatus(userId) {
        const user = await this.findAdminUserById(userId);
        return {
            enabled: !!user.twoFactorEnabled,
            pendingSetup: !!user.twoFactorTempSecret,
        };
    }
    async beginSetup(userId, meta) {
        const user = await this.findAdminUserById(userId);
        const secret = (0, otplib_1.generateSecret)();
        const issuer = this.configService.get('TWO_FACTOR_ISSUER') || 'PrestService';
        const otpauthUrl = (0, otplib_1.generateURI)({
            issuer,
            label: user.email,
            secret,
        });
        const qrCodeDataUrl = await qrcode_1.default.toDataURL(otpauthUrl);
        await this.users.findByIdAndUpdate(userId, {
            $set: { twoFactorTempSecret: this.encryptSecret(secret) },
        });
        await this.auditLogs.record({
            userId,
            email: user.email,
            event: 'two_factor_setup_started',
            status: 'pending',
            role: user.role,
            ip: meta?.ip,
            userAgent: meta?.ua,
        });
        return {
            manualEntryKey: secret,
            otpauthUrl,
            qrCodeDataUrl,
        };
    }
    async enable(userId, code, meta) {
        const user = await this.findAdminUserById(userId);
        if (!user.twoFactorTempSecret) {
            throw new common_1.BadRequestException('Aucune configuration 2FA en attente');
        }
        const secret = this.decryptSecret(user.twoFactorTempSecret);
        const isValid = await (0, otplib_1.verify)({
            secret,
            token: this.sanitizeCode(code),
        });
        if (!isValid) {
            await this.auditLogs.record({
                userId,
                email: user.email,
                event: 'two_factor_enable',
                status: 'failure',
                role: user.role,
                ip: meta?.ip,
                userAgent: meta?.ua,
            });
            throw new common_1.UnauthorizedException('Code 2FA invalide');
        }
        await this.users.findByIdAndUpdate(userId, {
            $set: {
                twoFactorSecret: this.encryptSecret(secret),
                twoFactorEnabled: true,
                twoFactorEnabledAt: new Date(),
            },
            $unset: { twoFactorTempSecret: 1 },
        });
        await this.auditLogs.record({
            userId,
            email: user.email,
            event: 'two_factor_enable',
            status: 'success',
            role: user.role,
            ip: meta?.ip,
            userAgent: meta?.ua,
        });
        return { success: true };
    }
    async disable(userId, code, meta) {
        const user = await this.findAdminUserById(userId);
        if (!user.twoFactorEnabled || !user.twoFactorSecret) {
            throw new common_1.BadRequestException('La 2FA n est pas active');
        }
        const secret = this.decryptSecret(user.twoFactorSecret);
        const isValid = await (0, otplib_1.verify)({
            secret,
            token: this.sanitizeCode(code),
        });
        if (!isValid) {
            await this.auditLogs.record({
                userId,
                email: user.email,
                event: 'two_factor_disable',
                status: 'failure',
                role: user.role,
                ip: meta?.ip,
                userAgent: meta?.ua,
            });
            throw new common_1.UnauthorizedException('Code 2FA invalide');
        }
        await this.users.findByIdAndUpdate(userId, {
            $set: { twoFactorEnabled: false },
            $unset: {
                twoFactorSecret: 1,
                twoFactorTempSecret: 1,
                twoFactorEnabledAt: 1,
            },
        });
        await this.auditLogs.record({
            userId,
            email: user.email,
            event: 'two_factor_disable',
            status: 'success',
            role: user.role,
            ip: meta?.ip,
            userAgent: meta?.ua,
        });
        return { success: true };
    }
    requiresTwoFactor(user) {
        return ((user?.role === user_entity_1.UserRole.admin || user?.role === user_entity_1.UserRole.superadmin) &&
            !!user?.twoFactorEnabled);
    }
    async createLoginChallenge(user, meta) {
        this.assertAdminRole(user.role);
        const challengeExpiresIn = toStringValue(this.configService.get('TWO_FACTOR_CHALLENGE_EXPIRES_IN')) ?? '5m';
        const payload = {
            sub: String(user._id),
            email: user.email,
            role: user.role,
            typ: '2fa_login',
            realm: 'user',
        };
        const token = this.jwt.sign(payload, {
            secret: this.configService.get('auth.accessToken'),
            expiresIn: challengeExpiresIn,
        });
        await this.auditLogs.record({
            userId: payload.sub,
            email: user.email,
            event: 'two_factor_login_challenge',
            status: 'pending',
            role: user.role,
            ip: meta?.ip,
            userAgent: meta?.ua,
        });
        return {
            requiresTwoFactor: true,
            twoFactorToken: token,
            message: 'Code de double authentification requis',
        };
    }
    async verifyLoginChallenge(challengeToken, code, meta) {
        let payload;
        try {
            payload = this.jwt.verify(challengeToken, {
                secret: this.configService.get('auth.accessToken'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Challenge 2FA invalide ou expiré');
        }
        if (payload.typ !== '2fa_login') {
            throw new common_1.UnauthorizedException('Challenge 2FA invalide');
        }
        const user = await this.findAdminUserById(payload.sub);
        if (!user.twoFactorEnabled || !user.twoFactorSecret) {
            throw new common_1.UnauthorizedException('2FA non active pour ce compte');
        }
        const secret = this.decryptSecret(user.twoFactorSecret);
        const isValid = await (0, otplib_1.verify)({
            secret,
            token: this.sanitizeCode(code),
        });
        if (!isValid) {
            await this.auditLogs.record({
                userId: payload.sub,
                email: payload.email,
                event: 'two_factor_login_verify',
                status: 'failure',
                role: payload.role,
                ip: meta?.ip,
                userAgent: meta?.ua,
            });
            throw new common_1.UnauthorizedException('Code 2FA invalide');
        }
        await this.auditLogs.record({
            userId: payload.sub,
            email: payload.email,
            event: 'two_factor_login_verify',
            status: 'success',
            role: payload.role,
            ip: meta?.ip,
            userAgent: meta?.ua,
            metadata: { via: 'totp', ip: (0, security_utils_1.normalizeIp)(meta?.ip) },
        });
        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
};
exports.TwoFactorService = TwoFactorService;
exports.TwoFactorService = TwoFactorService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService,
        mongoose_2.Model,
        admin_audit_log_service_1.AdminAuditLogService])
], TwoFactorService);
//# sourceMappingURL=two-factor.service.js.map