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
const instagram_module_1 = require("./instagram/instagram.module");
const contact_module_1 = require("./contact/contact.module");
const services_content_module_1 = require("./services-content/services-content.module");
const about_content_module_1 = require("./about-content/about-content.module");
function coerceExpires(raw, fallback) {
    if (raw === undefined || raw === null || raw === '')
        return fallback;
    if (typeof raw === 'number')
        return raw;
    return /^\d+$/.test(raw) ? Number(raw) : raw;
}
const mongoLog = new common_1.Logger('MongoDB');
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                load: [configuration_1.default],
            }),
            jwt_1.JwtModule.registerAsync({
                global: true,
                inject: [config_1.ConfigService],
                useFactory: (cfg) => {
                    const secret = cfg.get('auth.accessToken');
                    if (!secret) {
                        throw new Error('JWT access token secret is required');
                    }
                    const rawExp = cfg.get('auth.accessIn', '60m');
                    const expiresIn = coerceExpires(rawExp, '60m');
                    return {
                        secret,
                        signOptions: { expiresIn },
                    };
                },
            }),
            mongoose_1.MongooseModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: () => {
                    const failFastOnDisconnect = String(process.env.MONGO_FAIL_FAST_ON_DISCONNECT ?? 'true').toLowerCase() === 'true';
                    const inProduction = String(process.env.NODE_ENV).toLowerCase() === 'production';
                    return {
                        uri: process.env.MONGO_URI,
                        serverSelectionTimeoutMS: 10000,
                        connectTimeoutMS: 10000,
                        socketTimeoutMS: 45000,
                        maxPoolSize: 10,
                        minPoolSize: 1,
                        retryWrites: true,
                        retryReads: true,
                        bufferCommands: false,
                        retryAttempts: Number(process.env.MONGO_RETRY_ATTEMPTS ?? 6),
                        retryDelay: Number(process.env.MONGO_RETRY_DELAY_MS ?? 3000),
                        connectionFactory: (connection) => {
                            connection.on('connected', () => {
                                mongoLog.log('Connected');
                            });
                            connection.on('error', (error) => {
                                const message = error instanceof Error ? error.message : String(error);
                                mongoLog.error(`Error: ${message}`);
                            });
                            connection.on('disconnected', () => {
                                mongoLog.error('Disconnected');
                                if (inProduction && failFastOnDisconnect) {
                                    mongoLog.error('Fail-fast enabled: exiting process after Mongo disconnect');
                                    setTimeout(() => process.exit(1), 250);
                                }
                            });
                            return connection;
                        },
                    };
                },
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
            media_module_1.MediaModule,
            instagram_module_1.InstagramModule,
            contact_module_1.ContactModule,
            services_content_module_1.ServicesContentModule,
            about_content_module_1.AboutContentModule,
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