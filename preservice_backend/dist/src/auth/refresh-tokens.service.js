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
exports.RefreshTokensService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const mongoose_2 = require("mongoose");
const refresh_token_schema_1 = require("./schemas/refresh-token.schema");
const config_1 = require("@nestjs/config");
const sha256 = (s) => (0, crypto_1.createHash)('sha256').update(s, 'utf8').digest('hex');
function coerceExpires(raw, fallback) {
    if (raw === undefined || raw === null || raw === '')
        return fallback;
    if (typeof raw === 'number')
        return raw;
    return /^\d+$/.test(raw) ? Number(raw) : raw;
}
let RefreshTokensService = class RefreshTokensService {
    configService;
    jwt;
    model;
    refreshSecret;
    refreshExpiresIn;
    constructor(configService, jwt, model) {
        this.configService = configService;
        this.jwt = jwt;
        this.model = model;
        this.refreshSecret = this.configService.get('auth.refreshToken');
        const raw = this.configService.get('auth.refreshIn');
        this.refreshExpiresIn = coerceExpires(raw, '7d');
    }
    cookieOptions(expiresAt) {
        const secure = String(this.configService.get('auth.cookieSecure')).toLowerCase() === 'true';
        const domain = this.configService.get('auth.cookieDomain') || undefined;
        return {
            httpOnly: true,
            secure,
            sameSite: secure ? 'none' : 'lax',
            domain,
            path: '/api/auth',
            expires: expiresAt,
        };
    }
    async generate(userId, accountType, meta) {
        for (let i = 0; i < 3; i++) {
            const payload = { sub: userId, typ: 'refresh', atp: accountType };
            const token = this.jwt.sign(payload, {
                secret: this.refreshSecret,
                expiresIn: this.refreshExpiresIn,
                jwtid: (0, crypto_1.randomUUID)(),
            });
            const decoded = this.jwt.decode(token);
            const exp = decoded?.exp;
            if (!exp)
                throw new Error('No exp in refresh token');
            const expiresAt = new Date(exp * 1000);
            const tokenHash = sha256(token);
            try {
                await this.model.create({
                    tokenHash,
                    userId: new mongoose_2.Types.ObjectId(userId),
                    accountType,
                    expiresAt,
                    userAgent: meta?.ua,
                    ip: meta?.ip,
                });
                return { token, expiresAt, cookie: this.cookieOptions(expiresAt) };
            }
            catch (e) {
                if (e?.code === 11000) {
                    continue;
                }
                throw e;
            }
        }
        throw new common_1.ConflictException('Failed to generate a unique refresh token');
    }
    async verifyAndRotate(oldToken, userIdHint, expectedAccountType = 'user', meta) {
        let payload;
        try {
            payload = this.jwt.verify(oldToken, { secret: this.refreshSecret });
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh token invalide/expiré');
        }
        const hash = sha256(oldToken);
        const doc = await this.model.findOne({ tokenHash: hash });
        if (!doc || doc.revokedAt)
            throw new common_1.UnauthorizedException('Refresh token révoqué');
        if (userIdHint && String(doc.userId) !== String(userIdHint))
            throw new common_1.UnauthorizedException('Incohérence utilisateur');
        if (doc.accountType !== expectedAccountType)
            throw new common_1.UnauthorizedException('Type de compte du refresh incorrect');
        doc.revokedAt = new Date();
        const { token: newToken, expiresAt } = await this.generate(String(doc.userId), doc.accountType, meta);
        doc.replacedByHash = sha256(newToken);
        await doc.save();
        return { newToken, userId: String(doc.userId), expiresAt, cookie: this.cookieOptions(expiresAt), accountType: doc.accountType, };
    }
    async revoke(token) {
        const hash = sha256(token);
        await this.model.updateOne({ tokenHash: hash }, { $set: { revokedAt: new Date() } });
    }
    async revokeAllForUser(userId, accountType) {
        const query = { userId: new mongoose_2.Types.ObjectId(userId) };
        if (accountType)
            query.accountType = accountType;
        await this.model.updateMany({ userId: new mongoose_2.Types.ObjectId(userId) }, { $set: { revokedAt: new Date() } });
    }
    cookieOptionsPublic(expiresAt) { return this.cookieOptions(expiresAt); }
};
exports.RefreshTokensService = RefreshTokensService;
exports.RefreshTokensService = RefreshTokensService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, mongoose_1.InjectModel)(refresh_token_schema_1.RefreshToken.name)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService,
        mongoose_2.Model])
], RefreshTokensService);
//# sourceMappingURL=refresh-tokens.service.js.map