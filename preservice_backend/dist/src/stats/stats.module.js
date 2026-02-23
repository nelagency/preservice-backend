"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const stats_controller_1 = require("./stats.controller");
const stats_service_1 = require("./stats.service");
const event_entity_1 = require("../events/entities/event.entity");
const demande_entity_1 = require("../demandes/entities/demande.entity");
const avi_entity_1 = require("../avis/entities/avi.entity");
const participation_entity_1 = require("../participation/entities/participation.entity");
let StatsModule = class StatsModule {
};
exports.StatsModule = StatsModule;
exports.StatsModule = StatsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: event_entity_1.Event.name, schema: event_entity_1.EventSchema },
                { name: participation_entity_1.Participation.name, schema: participation_entity_1.ParticipationSchema },
                { name: demande_entity_1.Demande.name, schema: demande_entity_1.DemandeSchema },
                { name: avi_entity_1.Avi.name, schema: avi_entity_1.AvisSchema },
            ]),
        ],
        controllers: [stats_controller_1.StatsController],
        providers: [stats_service_1.StatsService],
    })
], StatsModule);
//# sourceMappingURL=stats.module.js.map