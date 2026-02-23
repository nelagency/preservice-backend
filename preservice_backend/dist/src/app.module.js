"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const events_module_1 = require("./events/events.module");
const serveur_module_1 = require("./serveur/serveur.module");
const users_module_1 = require("./users/users.module");
const demandes_module_1 = require("./demandes/demandes.module");
const avis_module_1 = require("./avis/avis.module");
const auth_module_1 = require("./auth/auth.module");
const core_1 = require("@nestjs/core");
const roles_guard_1 = require("./common/guards/roles.guard");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const configuration_1 = __importDefault(require("../config/configuration"));
const jwt_1 = require("@nestjs/jwt");
const participation_module_1 = require("./participation/participation.module");
const mail_module_1 = require("./mail/mail.module");
const stats_module_1 = require("./stats/stats.module");
const timesheets_module_1 = require("./timesheets/timesheets.module");
const notifications_module_1 = require("./notifications/notifications.module");
const media_module_1 = require("./media/media.module");
function coerceExpires(raw, fallback) {
    if (raw === undefined || raw === null || raw === '')
        return fallback;
    if (typeof raw === 'number')
        return raw;
    return /^\d+$/.test(raw) ? Number(raw) : raw;
}
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env', load: [configuration_1.default] }),
            jwt_1.JwtModule.registerAsync({
                global: true,
                inject: [config_1.ConfigService],
                useFactory: (cfg) => {
                    const secret = cfg.get('auth.accessToken') ?? 'changeme';
                    const rawExp = cfg.get('auth.accessIn', '60m');
                    const expiresIn = coerceExpires(rawExp, '60m');
                    return {
                        secret,
                        signOptions: { expiresIn },
                    };
                },
            }),
            mongoose_1.MongooseModule.forRoot((process.env.MONGO_URI), {
                serverSelectionTimeoutMS: 2000,
                maxPoolSize: 5
            }),
            auth_module_1.AuthModule,
            events_module_1.EventsModule,
            serveur_module_1.ServeurModule,
            users_module_1.UsersModule,
            demandes_module_1.DemandesModule,
            avis_module_1.AvisModule,
            participation_module_1.ParticipationModule,
            mail_module_1.MailModule,
            stats_module_1.StatsModule,
            timesheets_module_1.TimesheetsModule,
            notifications_module_1.NotificationsModule,
            media_module_1.MediaModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map