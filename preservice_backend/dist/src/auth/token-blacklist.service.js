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
exports.TokenBlacklistService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const crypto_1 = require("crypto");
const mongoose_2 = require("mongoose");
const blacklisted_token_schema_1 = require("./schemas/blacklisted-token.schema");
function sha256(input) {
    return (0, crypto_1.createHash)('sha256').update(input, 'utf8').digest('hex');
}
let TokenBlacklistService = class TokenBlacklistService {
    model;
    constructor(model) {
        this.model = model;
    }
    async add(token, userId, expSeconds) {
        if (!token || !expSeconds)
            return;
        const tokenHash = sha256(token);
        const expiresAt = new Date(expSeconds * 1000);
        await this.model.updateOne({ tokenHash }, { $set: { tokenHash, userId: userId ? new mongoose_2.Types.ObjectId(userId) : undefined, expiresAt } }, { upsert: true, setDefaultsOnInsert: true });
    }
    async has(token) {
        const tokenHash = sha256(token);
        const exists = await this.model.exists({ tokenHash });
        return !!exists;
    }
};
exports.TokenBlacklistService = TokenBlacklistService;
exports.TokenBlacklistService = TokenBlacklistService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(blacklisted_token_schema_1.BlacklistedToken.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TokenBlacklistService);
//# sourceMappingURL=token-blacklist.service.js.map