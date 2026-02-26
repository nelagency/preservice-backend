import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsModule } from './events/events.module';
import { ServeurModule } from './serveur/serveur.module';
import { UsersModule } from './users/users.module';
import { DemandesModule } from './demandes/demandes.module';
import { AvisModule } from './avis/avis.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import configuration from 'config/configuration';
import { JwtModule } from '@nestjs/jwt';
import { ParticipationModule } from './participation/participation.module';
import { MailModule } from './mail/mail.module';
import { StatsModule } from './stats/stats.module';
import { TimesheetsModule } from './timesheets/timesheets.module';

import type { StringValue } from 'ms';
import { NotificationsModule } from './notifications/notifications.module';
import { MediaModule } from './media/media.module';
import { Connection } from 'mongoose';

function coerceExpires(raw: string | number | undefined, fallback: number | StringValue): number | StringValue {
  if (raw === undefined || raw === null || raw === '') return fallback;
  if (typeof raw === 'number') return raw;
  // si "3600" -> number, sinon on garde la string ("1d", "12h", etc.)
  return /^\d+$/.test(raw) ? Number(raw) : (raw as StringValue);
}

const mongoLog = new Logger('MongoDB');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env', load: [configuration] }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const secret = cfg.get<string>('auth.accessToken') ?? 'changeme';
        const rawExp = cfg.get<string | number>('auth.accessIn', '60m');
        const expiresIn = coerceExpires(rawExp, '60m'); 
        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: () => {
        const failFastOnDisconnect =
          String(process.env.MONGO_FAIL_FAST_ON_DISCONNECT ?? 'true').toLowerCase() === 'true';
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
          connectionFactory: (connection: Connection) => {
            connection.on('connected', () => {
              mongoLog.log('Connected');
            });
            connection.on('error', (error: unknown) => {
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
    AuthModule,
    EventsModule,
    ServeurModule,
    UsersModule,
    DemandesModule,
    AvisModule,
    ParticipationModule,
    MailModule,
    StatsModule,
    TimesheetsModule,
    NotificationsModule,
    MediaModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})

export class AppModule { }
