"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const jwt_strategy_1 = require("./jwt.strategy");
const user_entity_1 = require("../users/entities/user.entity");
const blacklisted_token_schema_1 = require("./schemas/blacklisted-token.schema");
const token_blacklist_service_1 = require("./token-blacklist.service");
const refresh_token_schema_1 = require("./schemas/refresh-token.schema");
const refresh_tokens_service_1 = require("./refresh-tokens.service");
const serveur_auth_service_1 = require("./serveur-auth.service");
const serveur_auth_controller_1 = require("./serveur-auth.controller");
const serveur_module_1 = require("../serveur/serveur.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({}),
            mongoose_1.MongooseModule.forFeature([
                { name: user_entity_1.User.name, schema: user_entity_1.UserSchema },
                { name: blacklisted_token_schema_1.BlacklistedToken.name, schema: blacklisted_token_schema_1.BlacklistedTokenSchema },
                { name: refresh_token_schema_1.RefreshToken.name, schema: refresh_token_schema_1.RefreshTokenSchema },
            ]),
            serveur_module_1.ServeurModule
        ],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, token_blacklist_service_1.TokenBlacklistService, refresh_tokens_service_1.RefreshTokensService, serveur_auth_service_1.ServeurAuthService],
        controllers: [auth_controller_1.AuthController, serveur_auth_controller_1.ServeurAuthController],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map