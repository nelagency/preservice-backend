"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_entity_1 = require("../users/entities/user.entity");
const refresh_tokens_service_1 = require("./refresh-tokens.service");
const config_1 = require("@nestjs/config");
const mail_service_1 = require("../mail/mail.service");
const security_utils_1 = require("../common/security.utils");
const admin_audit_log_service_1 = require("./admin-audit-log.service");
function asIdString(id) {
    if (typeof id === 'string')
        return id;
    if (id instanceof mongoose_2.Types.ObjectId)
        return id.toHexString();
    if (id && typeof id === 'object' && 'toString' in id) {
        const maybe = id.toString();
        if (maybe && maybe !== '[object Object]')
            return maybe;
    }
    return '';
}
function toStringValue(value) {
    if (typeof value === 'number')
        return value;
    if (typeof value === 'string' && value.trim())
        return value;
    return undefined;
}
let AuthService = AuthService_1 = class AuthService {
    configService;
    jwt;
    users;
    rts;
    mail;
    auditLogs;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(configService, jwt, users, rts, mail, auditLogs) {
        this.configService = configService;
        this.jwt = jwt;
        this.users = users;
        this.rts = rts;
        this.mail = mail;
        this.auditLogs = auditLogs;
    }
    signToken(user) {
        const ACCESS_SECRET = this.configService.get('auth.accessToken');
        if (!ACCESS_SECRET) {
            throw new common_1.UnauthorizedException('Access token secret is not configured');
        }
        const payload = {
            sub: user.id?.toString() ?? asIdString(user._id),
            email: user.email,
            role: user.role,
            realm: 'user',
            nom: user.nom,
            isActive: user.isActive,
        };
        const ACCESS_EXPIRES_IN = toStringValue(this.configService.get('auth.accessIn') ?? '20m');
        return {
            access_token: this.jwt.sign(payload, {
                secret: ACCESS_SECRET,
                expiresIn: ACCESS_EXPIRES_IN,
            }),
            user: payload,
        };
    }
    ensureAdminIpAllowed(user, ip) {
        if (!ip)
            return;
        if (user.role !== user_entity_1.UserRole.admin && user.role !== user_entity_1.UserRole.superadmin) {
            return;
        }
        const normalizedIp = (0, security_utils_1.normalizeIp)(ip);
        if (!(0, security_utils_1.isAllowedAdminIp)(normalizedIp)) {
            this.logger.warn(`Blocked admin authentication for ${user.email} from IP ${normalizedIp || 'unknown'}`);
            throw new common_1.UnauthorizedException('Admin access denied from this IP');
        }
    }
    logAdminAccess(event, user, meta) {
        if (user.role !== user_entity_1.UserRole.admin && user.role !== user_entity_1.UserRole.superadmin) {
            return;
        }
        this.logger.log(JSON.stringify({
            type: 'admin_auth',
            event,
            email: user.email,
            role: user.role,
            ip: (0, security_utils_1.normalizeIp)(meta?.ip),
            userAgent: meta?.ua ?? '',
            at: new Date().toISOString(),
        }));
    }
    async validateUser(email, mot_passe) {
        const doc = await this.users
            .findOne({ email })
            .select('+mot_passe +twoFactorSecret +twoFactorTempSecret')
            .lean(false);
        if (!doc)
            throw new common_1.UnauthorizedException('Email ou mot de passe invalide');
        const withPassword = doc;
        const ok = await bcrypt.compare(mot_passe, withPassword.mot_passe);
        if (!ok)
            throw new common_1.UnauthorizedException('Mot de passe invalide');
        if (doc.isActive === false)
            throw new common_1.UnauthorizedException('Compte inactif');
        const raw = doc.toObject();
        if (!raw.email || !raw.role) {
            throw new common_1.UnauthorizedException('Utilisateur invalide');
        }
        return {
            _id: raw._id,
            email: raw.email,
            role: raw.role,
            nom: raw.nom,
            isActive: raw.isActive,
            twoFactorEnabled: raw
                .twoFactorEnabled,
        };
    }
    async login(email, mot_passe, meta) {
        const user = await this.validateUser(email, mot_passe);
        this.ensureAdminIpAllowed(user, meta?.ip);
        const tokenUser = {
            _id: user._id,
            email: user.email,
            role: user.role,
            nom: user.nom,
            isActive: user.isActive,
            twoFactorEnabled: user.twoFactorEnabled,
        };
        const at = this.signToken(tokenUser);
        const rt = await this.rts.generate(at.user.sub, 'user', meta);
        this.logAdminAccess('login', tokenUser, meta);
        return { ...at, refresh_token: rt.token, refresh_expires_at: rt.expiresAt };
    }
    async register(data, meta) {
        const exists = await this.users.exists({ email: data.email });
        if (exists)
            throw new common_1.UnauthorizedException('Email deja utilise');
        const created = new this.users(data);
        await created.save();
        const user = created.toObject();
        if (!user.email || !user.role) {
            throw new common_1.UnauthorizedException('Utilisateur invalide');
        }
        const tokenUser = {
            _id: user._id,
            email: user.email,
            role: user.role,
            nom: user.nom,
            isActive: user.isActive,
        };
        const at = this.signToken(tokenUser);
        const rt = await this.rts.generate(at.user.sub, 'user', meta);
        return { ...at, refresh_token: rt.token, refresh_expires_at: rt.expiresAt };
    }
    async refresh(oldRefreshToken, userIdHint, meta) {
        const { newToken, userId, expiresAt, cookie } = await this.rts.verifyAndRotate(oldRefreshToken, userIdHint, 'user', meta);
        const userDoc = await this.users.findById(userId).lean();
        if (!userDoc)
            throw new common_1.UnauthorizedException('Utilisateur introuvable');
        if (!userDoc.email || !userDoc.role) {
            throw new common_1.UnauthorizedException('Utilisateur introuvable');
        }
        this.ensureAdminIpAllowed({
            _id: userDoc._id,
            email: userDoc.email,
            role: userDoc.role,
            nom: userDoc.nom,
            isActive: userDoc.isActive,
        }, meta?.ip);
        const refreshedUser = {
            _id: userDoc._id,
            email: userDoc.email,
            role: userDoc.role,
            nom: userDoc.nom,
            isActive: userDoc.isActive,
        };
        const at = this.signToken(refreshedUser);
        this.logAdminAccess('refresh', refreshedUser, meta);
        return {
            ...at,
            refresh_token: newToken,
            refresh_expires_at: expiresAt,
            cookie,
        };
    }
    async findUserForTwoFactor(userId) {
        const user = await this.users
            .findById(userId)
            .select('+twoFactorSecret +twoFactorTempSecret')
            .lean();
        if (!user || !user.email || !user.role) {
            throw new common_1.UnauthorizedException('Utilisateur introuvable');
        }
        return user;
    }
    async completeTwoFactorLogin(userId, meta) {
        const user = await this.findUserForTwoFactor(userId);
        this.ensureAdminIpAllowed(user, meta?.ip);
        const tokenUser = {
            _id: user._id,
            email: user.email,
            role: user.role,
            nom: user.nom,
            isActive: user.isActive,
            twoFactorEnabled: user.twoFactorEnabled,
        };
        const at = this.signToken(tokenUser);
        const rt = await this.rts.generate(at.user.sub, 'user', meta);
        this.logAdminAccess('login', tokenUser, meta);
        await this.auditLogs.record({
            userId: at.user.sub,
            email: user.email,
            event: 'admin_login_completed',
            status: 'success',
            role: String(user.role),
            ip: meta?.ip,
            userAgent: meta?.ua,
            metadata: { via: 'password+totp' },
        });
        return { ...at, refresh_token: rt.token, refresh_expires_at: rt.expiresAt };
    }
    async requestPasswordReset(email) {
        const user = await this.users
            .findOne({ email: email.toLowerCase().trim() })
            .lean();
        if (!user) {
            return {
                success: true,
                message: 'Si un compte existe, un lien de reinitialisation a ete envoye.',
            };
        }
        const secret = process.env.PASSWORD_RESET_SECRET ||
            this.configService.get('auth.refreshToken') ||
            this.configService.get('auth.accessToken');
        if (!secret)
            throw new common_1.UnauthorizedException('Reset password secret is not configured');
        const expiresIn = process.env.PASSWORD_RESET_EXPIRES_IN || '15m';
        const token = this.jwt.sign({ sub: asIdString(user._id), typ: 'pwd_reset' }, { secret, expiresIn: expiresIn });
        const frontendBase = (process.env.FRONTEND_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
        const link = `${frontendBase}/reset-password?token=${encodeURIComponent(token)}`;
        await this.mail.generic(user.email, 'Reinitialisation du mot de passe', {
            intro: 'Vous avez demande une reinitialisation de mot de passe.',
            details: { Expiration: expiresIn },
            ctaLabel: 'Reinitialiser mon mot de passe',
            ctaHref: link,
            outro: 'Si vous n etes pas a l origine de cette demande, ignorez cet email.',
        });
        return {
            success: true,
            message: 'Si un compte existe, un lien de reinitialisation a ete envoye.',
            reset_link_preview: process.env.NODE_ENV === 'production' ? undefined : link,
        };
    }
    async resetPassword(resetToken, newPassword) {
        const secret = process.env.PASSWORD_RESET_SECRET ||
            this.configService.get('auth.refreshToken') ||
            this.configService.get('auth.accessToken');
        if (!secret)
            throw new common_1.UnauthorizedException('Reset password secret is not configured');
        let payload;
        try {
            payload = this.jwt.verify(resetToken, { secret });
        }
        catch {
            throw new common_1.UnauthorizedException('Token de reinitialisation invalide ou expire');
        }
        if (payload?.typ !== 'pwd_reset' || !payload?.sub) {
            throw new common_1.UnauthorizedException('Token de reinitialisation invalide');
        }
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);
        const updated = await this.users
            .findByIdAndUpdate(payload.sub, { mot_passe: hashed }, { new: true })
            .lean();
        if (!updated)
            throw new common_1.UnauthorizedException('Utilisateur introuvable');
        await this.rts.revokeAllForUser(payload.sub, 'user');
        return { success: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService,
        mongoose_2.Model,
        refresh_tokens_service_1.RefreshTokensService,
        mail_service_1.MailService,
        admin_audit_log_service_1.AdminAuditLogService])
], AuthService);
//# sourceMappingURL=auth.service.js.map