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
exports.StatsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stats_service_1 = require("./stats.service");
const public_decorator_1 = require("../common/decorators/public.decorator");
let StatsController = class StatsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    overview() { return this.svc.overview(); }
};
exports.StatsController = StatsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Tableau de bord (agrégats globaux)' }),
    (0, swagger_1.ApiOkResponse)({ description: 'KPIs + séries' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatsController.prototype, "overview", null);
exports.StatsController = StatsController = __decorate([
    (0, swagger_1.ApiTags)('Stats'),
    (0, common_1.Controller)('stats'),
    __metadata("design:paramtypes", [stats_service_1.StatsService])
], StatsController);
//# sourceMappingURL=stats.controller.js.map