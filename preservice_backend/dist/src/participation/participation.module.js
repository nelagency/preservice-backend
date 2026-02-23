"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipationModule = void 0;
const common_1 = require("@nestjs/common");
const participation_service_1 = require("./participation.service");
const participation_controller_1 = require("./participation.controller");
const mongoose_1 = require("@nestjs/mongoose");
const participation_entity_1 = require("./entities/participation.entity");
const event_entity_1 = require("../events/entities/event.entity");
const mail_module_1 = require("../mail/mail.module");
const notifications_module_1 = require("../notifications/notifications.module");
let ParticipationModule = class ParticipationModule {
};
exports.ParticipationModule = ParticipationModule;
exports.ParticipationModule = ParticipationModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([
                { name: participation_entity_1.Participation.name, schema: participation_entity_1.ParticipationSchema },
                { name: event_entity_1.Event.name, schema: event_entity_1.EventSchema },
            ]),
            mail_module_1.MailModule,
            notifications_module_1.NotificationsModule
        ],
        controllers: [participation_controller_1.ParticipationController],
        providers: [participation_service_1.ParticipationService],
        exports: [mongoose_1.MongooseModule, participation_service_1.ParticipationService]
    })
], ParticipationModule);
//# sourceMappingURL=participation.module.js.map