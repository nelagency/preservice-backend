"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimesheetsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const timesheet_entity_1 = require("./entities/timesheet.entity");
const participation_module_1 = require("../participation/participation.module");
const events_module_1 = require("../events/events.module");
const timesheets_controller_1 = require("./timesheets.controller");
const timesheets_service_1 = require("./timesheets.service");
const serveur_module_1 = require("../serveur/serveur.module");
const notifications_module_1 = require("../notifications/notifications.module");
let TimesheetsModule = class TimesheetsModule {
};
exports.TimesheetsModule = TimesheetsModule;
exports.TimesheetsModule = TimesheetsModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([
                { name: timesheet_entity_1.Timesheet.name, schema: timesheet_entity_1.TimesheetSchema },
            ]),
            participation_module_1.ParticipationModule,
            events_module_1.EventsModule,
            serveur_module_1.ServeurModule,
            notifications_module_1.NotificationsModule
        ],
        controllers: [timesheets_controller_1.TimesheetsController],
        providers: [timesheets_service_1.TimesheetsService]
    })
], TimesheetsModule);
//# sourceMappingURL=timesheets.module.js.map