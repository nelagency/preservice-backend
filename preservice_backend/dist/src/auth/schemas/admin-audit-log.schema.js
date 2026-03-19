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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuditLogSchema = exports.AdminAuditLog = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let AdminAuditLog = class AdminAuditLog {
    userId;
    email;
    event;
    status;
    role;
    ip;
    userAgent;
    metadata;
    createdAt;
};
exports.AdminAuditLog = AdminAuditLog;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: false, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], AdminAuditLog.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true, lowercase: true, index: true }),
    __metadata("design:type", String)
], AdminAuditLog.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], AdminAuditLog.prototype, "event", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], AdminAuditLog.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], AdminAuditLog.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], AdminAuditLog.prototype, "ip", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], AdminAuditLog.prototype, "userAgent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], AdminAuditLog.prototype, "metadata", void 0);
exports.AdminAuditLog = AdminAuditLog = __decorate([
    (0, mongoose_1.Schema)({ timestamps: { createdAt: true, updatedAt: false } })
], AdminAuditLog);
exports.AdminAuditLogSchema = mongoose_1.SchemaFactory.createForClass(AdminAuditLog);
exports.AdminAuditLogSchema.index({ event: 1, createdAt: -1 });
exports.AdminAuditLogSchema.index({ email: 1, createdAt: -1 });
//# sourceMappingURL=admin-audit-log.schema.js.map