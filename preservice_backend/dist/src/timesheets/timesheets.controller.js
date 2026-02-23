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
exports.TimesheetsController = void 0;
const common_1 = require("@nestjs/common");
const timesheets_service_1 = require("./timesheets.service");
const create_timesheet_dto_1 = require("./dto/create-timesheet.dto");
const review_timesheet_dto_1 = require("./dto/review-timesheet.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const pay_timesheet_dto_1 = require("./dto/pay-timesheet.dto");
let TimesheetsController = class TimesheetsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async submit(eventId, req, dto) {
        return this.svc.submitForEvent(eventId, req.user.sub, dto);
    }
    async mine(eventId, req) {
        return this.svc.getMineForEvent(eventId, req.user.sub);
    }
    async pending(status = 'submitted') {
        if (status === 'submitted')
            return this.svc.listPending();
        return this.svc.listPending();
    }
    async review(id, req, body) {
        return this.svc.review(id, req.user.sub, body);
    }
    async payOne(id, req, body) {
        return this.svc.pay(id, req.user.sub, body);
    }
    async myHistory(req) {
        const serveurId = req.user?.serveurId ?? req.user?.sub;
        return this.svc.listForServeur(serveurId);
    }
    async eventHistory(eventId) {
        return this.svc.listForEvent(eventId);
    }
};
exports.TimesheetsController = TimesheetsController;
__decorate([
    (0, common_1.Post)('events/:eventId/timesheets'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_timesheet_dto_1.CreateTimesheetDto]),
    __metadata("design:returntype", Promise)
], TimesheetsController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)('events/:eventId/timesheets/mine'),
    __param(0, (0, common_1.Param)('eventId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TimesheetsController.prototype, "mine", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('superadmin', 'admin'),
    (0, common_1.Get)('admin/timesheets'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TimesheetsController.prototype, "pending", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('superadmin', 'admin'),
    (0, common_1.Patch)('admin/timesheets/:id/review'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, review_timesheet_dto_1.ReviewTimesheetDto]),
    __metadata("design:returntype", Promise)
], TimesheetsController.prototype, "review", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('superadmin', 'admin'),
    (0, common_1.Patch)('admin/timesheets/:id/pay'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, pay_timesheet_dto_1.PayTimesheetDto]),
    __metadata("design:returntype", Promise)
], TimesheetsController.prototype, "payOne", null);
__decorate([
    (0, common_1.Get)('me/timesheets'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('serveur'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TimesheetsController.prototype, "myHistory", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('superadmin', 'admin'),
    (0, common_1.Get)('events/:eventId/timesheets'),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TimesheetsController.prototype, "eventHistory", null);
exports.TimesheetsController = TimesheetsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [timesheets_service_1.TimesheetsService])
], TimesheetsController);
//# sourceMappingURL=timesheets.controller.js.map