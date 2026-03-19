"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRateLimitService = void 0;
const common_1 = require("@nestjs/common");
let AuthRateLimitService = class AuthRateLimitService {
    buckets = new Map();
    consume(key, options) {
        const now = Date.now();
        const current = this.buckets.get(key);
        if (!current || current.resetAt <= now) {
            this.buckets.set(key, { count: 1, resetAt: now + options.windowMs });
            return;
        }
        if (current.count >= options.limit) {
            throw new common_1.HttpException(options.message, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        current.count += 1;
        this.buckets.set(key, current);
    }
    reset(key) {
        this.buckets.delete(key);
    }
};
exports.AuthRateLimitService = AuthRateLimitService;
exports.AuthRateLimitService = AuthRateLimitService = __decorate([
    (0, common_1.Injectable)()
], AuthRateLimitService);
//# sourceMappingURL=auth-rate-limit.service.js.map