"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServeurModule = void 0;
const common_1 = require("@nestjs/common");
const serveur_service_1 = require("./serveur.service");
const serveur_controller_1 = require("./serveur.controller");
const serveur_entity_1 = require("./entities/serveur.entity");
const mongoose_1 = require("@nestjs/mongoose");
const events_module_1 = require("../events/events.module");
const participation_module_1 = require("../participation/participation.module");
let ServeurModule = class ServeurModule {
};
exports.ServeurModule = ServeurModule;
exports.ServeurModule = ServeurModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([
                { name: serveur_entity_1.Serveur.name, schema: serveur_entity_1.ServeurSchema },
            ]),
            events_module_1.EventsModule,
            participation_module_1.ParticipationModule
        ],
        controllers: [serveur_controller_1.ServeurController],
        providers: [serveur_service_1.ServeurService],
        exports: [mongoose_1.MongooseModule],
    })
], ServeurModule);
//# sourceMappingURL=serveur.module.js.map