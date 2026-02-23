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
let AuthService = class AuthService {
    configService;
    jwt;
    users;
    rts;
    constructor(configService, jwt, users, rts) {
        this.configService = configService;
        this.jwt = jwt;
        this.users = users;
        this.rts = rts;
    }
    signToken(user) {
        const payload = {
            sub: user.id?.toString() ?? user._id?.toString(),
            email: user.email,
            role: user.role,
            nom: user.nom,
            isActive: user.isActive,
        };
        const ACCESS_SECRET = this.configService.get('auth.accessToken');
        const ACCESS_EXPIRES_IN = this.configService.get('auth.accessIn');
        return {
            access_token: this.jwt.sign(payload, {
                secret: ACCESS_SECRET,
                expiresIn: ACCESS_EXPIRES_IN,
            }),
            user: payload,
        };
    }
    async validateUser(email, mot_passe) {
        const doc = await this.users.findOne({ email }).select('+mot_passe').lean(false);
        if (!doc)
            throw new common_1.UnauthorizedException('Email ou mot de passe invalide');
        const ok = await bcrypt.compare(mot_passe, doc.mot_passe);
        if (!ok)
            throw new common_1.UnauthorizedException('Mot de passe invalide');
        if (doc.isActive === false)
            throw new common_1.UnauthorizedException('Compte inactif');
        const user = doc.toJSON();
        return user;
    }
    async login(email, mot_passe, meta) {
        const user = await this.validateUser(email, mot_passe);
        const at = this.signToken(user);
        const rt = await this.rts.generate(at.user.sub, 'user', meta);
        return { ...at, refresh_token: rt.token, refresh_expires_at: rt.expiresAt };
    }
    async register(data, meta) {
        const exists = await this.users.exists({ email: data.email });
        if (exists)
            throw new common_1.UnauthorizedException('Email déjà utilisé');
        const created = new this.users(data);
        await created.save();
        const user = created.toJSON();
        const at = this.signToken(user);
        const rt = await this.rts.generate(at.user.sub, 'user', meta);
        return { ...at, refresh_token: rt.token, refresh_expires_at: rt.expiresAt };
    }
    async refresh(oldRefreshToken, userIdHint, meta) {
        const { newToken, userId, expiresAt, cookie } = await this.rts.verifyAndRotate(oldRefreshToken, userIdHint, 'user', meta);
        const userDoc = await this.users.findById(userId).lean();
        if (!userDoc)
            throw new common_1.UnauthorizedException('Utilisateur introuvable');
        const at = this.signToken(userDoc);
        return { ...at, refresh_token: newToken, refresh_expires_at: expiresAt, cookie };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService,
        mongoose_2.Model,
        refresh_tokens_service_1.RefreshTokensService])
], AuthService);
//# sourceMappingURL=auth.service.js.map