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
var AdminAuditLogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuditLogService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const admin_audit_log_schema_1 = require("./schemas/admin-audit-log.schema");
const security_utils_1 = require("../common/security.utils");
let AdminAuditLogService = AdminAuditLogService_1 = class AdminAuditLogService {
    model;
    logger = new common_1.Logger(AdminAuditLogService_1.name);
    constructor(model) {
        this.model = model;
    }
    async record(payload) {
        try {
            await this.model.create({
                userId: payload.userId ? new mongoose_2.Types.ObjectId(payload.userId) : undefined,
                email: payload.email,
                event: payload.event,
                status: payload.status,
                role: payload.role,
                ip: (0, security_utils_1.normalizeIp)(payload.ip),
                userAgent: payload.userAgent,
                metadata: payload.metadata ?? {},
            });
        }
        catch (error) {
            this.logger.warn(`Failed to persist admin audit log for ${payload.event}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async list(limit = 50) {
        const normalizedLimit = Math.min(Math.max(limit, 1), 200);
        return this.model.find().sort({ createdAt: -1 }).limit(normalizedLimit).lean();
    }
};
exports.AdminAuditLogService = AdminAuditLogService;
exports.AdminAuditLogService = AdminAuditLogService = AdminAuditLogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(admin_audit_log_schema_1.AdminAuditLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AdminAuditLogService);
//# sourceMappingURL=admin-audit-log.service.js.map