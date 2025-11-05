import { Module } from '@nestjs/common';
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

function coerceExpires(raw: string | number | undefined, fallback: number | StringValue): number | StringValue {
  if (raw === undefined || raw === null || raw === '') return fallback;
  if (typeof raw === 'number') return raw;
  // si "3600" -> number, sinon on garde la string ("1d", "12h", etc.)
  return /^\d+$/.test(raw) ? Number(raw) : (raw as StringValue);
}

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
    MongooseModule.forRoot((process.env.MONGO_URI)!, {
      serverSelectionTimeoutMS: 2000,
      maxPoolSize: 5
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
