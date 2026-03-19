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
exports.ServeurAuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const refresh_tokens_service_1 = require("./refresh-tokens.service");
const config_1 = require("@nestjs/config");
const serveur_entity_1 = require("../serveur/entities/serveur.entity");
function toStringValue(value) {
    if (typeof value === 'number')
        return value;
    if (typeof value === 'string' && value.trim())
        return value;
    return undefined;
}
let ServeurAuthService = class ServeurAuthService {
    config;
    jwt;
    serveurs;
    rts;
    constructor(config, jwt, serveurs, rts) {
        this.config = config;
        this.jwt = jwt;
        this.serveurs = serveurs;
        this.rts = rts;
    }
    signToken(serveur) {
        const accessSecret = this.config.get('auth.accessToken');
        if (!accessSecret) {
            throw new common_1.UnauthorizedException('Access token secret is not configured');
        }
        const payload = {
            sub: serveur.id?.toString() ?? String(serveur._id),
            email: serveur.email,
            role: 'serveur',
            nom: `${serveur.prenom ?? ''} ${serveur.nom ?? ''}`.trim(),
            isActive: serveur.isActive,
            realm: 'serveur',
        };
        return {
            access_token: this.jwt.sign(payload, {
                secret: accessSecret,
                expiresIn: toStringValue(this.config.get('auth.accessIn') ?? '20m'),
            }),
            user: payload,
        };
    }
    async validateServeur(email, mot_passe) {
        const doc = await this.serveurs
            .findOne({ email })
            .select('+mot_passe')
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
        if (!raw.email) {
            throw new common_1.UnauthorizedException('Serveur invalide');
        }
        return {
            _id: raw._id,
            email: raw.email,
            prenom: raw.prenom,
            nom: raw.nom,
            isActive: raw.isActive,
        };
    }
    async login(email, mot_passe, meta) {
        const serveur = await this.validateServeur(email, mot_passe);
        const at = this.signToken(serveur);
        const rt = await this.rts.generate(at.user.sub, 'serveur', meta);
        return { ...at, refresh_token: rt.token, refresh_expires_at: rt.expiresAt };
    }
    async refresh(oldRefreshToken, userIdHint, meta) {
        const { newToken, userId, expiresAt } = await this.rts.verifyAndRotate(oldRefreshToken, userIdHint, 'serveur', meta);
        const user = await this.me(userId);
        const access = this.signToken({
            _id: user.sub,
            email: user.email,
            nom: user.nom,
            isActive: user.isActive,
        });
        return {
            ...access,
            refresh_token: newToken,
            refresh_expires_at: expiresAt,
        };
    }
    async me(serveurId) {
        const s = await this.serveurs.findById(serveurId).lean();
        if (!s)
            throw new common_1.UnauthorizedException('Serveur introuvable');
        if (!s.email)
            throw new common_1.UnauthorizedException('Serveur invalide');
        const at = this.signToken({
            _id: s._id,
            email: s.email,
            prenom: s.prenom,
            nom: s.nom,
            isActive: s.isActive,
        });
        return at.user;
    }
};
exports.ServeurAuthService = ServeurAuthService;
exports.ServeurAuthService = ServeurAuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, mongoose_1.InjectModel)(serveur_entity_1.Serveur.name)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService,
        mongoose_2.Model,
        refresh_tokens_service_1.RefreshTokensService])
], ServeurAuthService);
//# sourceMappingURL=serveur-auth.service.js.map