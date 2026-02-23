"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const notification_entity_1 = require("./entities/notification.entity");
const notifications_service_1 = require("./notifications.service");
const notifications_controller_1 = require("./notifications.controller");
const notifications_gateway_1 = require("./notifications.gateway");
const jwt_1 = require("@nestjs/jwt");
const serveur_entity_1 = require("../serveur/entities/serveur.entity");
const user_entity_1 = require("../users/entities/user.entity");
const event_entity_1 = require("../events/entities/event.entity");
const timesheet_entity_1 = require("../timesheets/entities/timesheet.entity");
const mail_module_1 = require("../mail/mail.module");
const email_module_1 = require("../email/email.module");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: notification_entity_1.Notification.name, schema: notification_entity_1.NotificationSchema },
                { name: serveur_entity_1.Serveur.name, schema: serveur_entity_1.ServeurSchema },
                { name: user_entity_1.User.name, schema: user_entity_1.UserSchema },
                { name: Event.name, schema: event_entity_1.EventSchema },
                { name: timesheet_entity_1.Timesheet.name, schema: timesheet_entity_1.TimesheetSchema },
            ]),
            mail_module_1.MailModule,
            email_module_1.EmailModule,
            jwt_1.JwtModule.register({
                secret: process.env.ACCESS_JWT_SECRET,
                signOptions: { expiresIn: '15m' },
            }),
        ],
        controllers: [notifications_controller_1.NotificationsController],
        providers: [notifications_service_1.NotificationsService, notifications_gateway_1.NotificationsGateway],
        exports: [notifications_service_1.NotificationsService, notifications_gateway_1.NotificationsGateway],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map