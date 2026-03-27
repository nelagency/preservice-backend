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
import mongoose, { Connection } from 'mongoose';
import { InstagramModule } from './instagram/instagram.module';
import { ContactModule } from './contact/contact.module';
import { ServicesContentModule } from './services-content/services-content.module';
import { AboutContentModule } from './about-content/about-content.module';

function coerceExpires(
  raw: string | number | undefined,
  fallback: number | StringValue,
): number | StringValue {
  if (raw === undefined || raw === null || raw === '') return fallback;
  if (typeof raw === 'number') return raw;
  // si "3600" -> number, sinon on garde la string ("1d", "12h", etc.)
  return /^\d+$/.test(raw) ? Number(raw) : (raw as StringValue);
}

const mongoLog = new Logger('MongoDB');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const secret = cfg.get<string>('auth.accessToken');
        if (!secret) {
          throw new Error('JWT access token secret is required');
        }
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
          String(
            process.env.MONGO_FAIL_FAST_ON_DISCONNECT ?? 'true',
          ).toLowerCase() === 'true';
        const inProduction =
          String(process.env.NODE_ENV).toLowerCase() === 'production';
        const mongoUri = process.env.MONGO_URI;
        const reconnectDelayMs = Number(
          process.env.MONGO_RECONNECT_DELAY_MS ?? 3000,
        );
        const reconnectAttempts = Number(
          process.env.MONGO_RECONNECT_ATTEMPTS ?? 20,
        );
        let reconnectInFlight = false;
        let reconnectTimer: NodeJS.Timeout | null = null;

        const mongoOptions = {
          uri: mongoUri,
          serverSelectionTimeoutMS: 10000,
          connectTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          heartbeatFrequencyMS: Number(
            process.env.MONGO_HEARTBEAT_FREQUENCY_MS ?? 10000,
          ),
          maxIdleTimeMS: Number(process.env.MONGO_MAX_IDLE_TIME_MS ?? 30000),
          family: Number(process.env.MONGO_IP_FAMILY ?? 4),
          maxPoolSize: 10,
          minPoolSize: 1,
          retryWrites: true,
          retryReads: true,
          bufferCommands: false,
        } as const;

        const scheduleReconnect = (connection: Connection) => {
          if (!mongoUri || reconnectInFlight || reconnectTimer) {
            return;
          }

          let attempt = 0;
          reconnectInFlight = true;

          const runReconnect = async () => {
            if (connection.readyState === 1) {
              reconnectInFlight = false;
              reconnectTimer = null;
              return;
            }

            attempt += 1;
            mongoLog.warn(
              `Reconnect attempt ${attempt}/${reconnectAttempts}...`,
            );

            try {
              await connection.openUri(mongoUri, mongoOptions);
              mongoLog.log('Manual reconnect succeeded');
              reconnectInFlight = false;
              reconnectTimer = null;
              return;
            } catch (error: unknown) {
              const message =
                error instanceof Error ? error.message : String(error);
              mongoLog.error(`Reconnect failed: ${message}`);
            }

            if (attempt >= reconnectAttempts) {
              reconnectInFlight = false;
              reconnectTimer = null;
              if (inProduction && failFastOnDisconnect) {
                mongoLog.error(
                  'Reconnect attempts exhausted: exiting process',
                );
                setTimeout(() => process.exit(1), 250);
              }
              return;
            }

            reconnectTimer = setTimeout(() => {
              reconnectTimer = null;
              void runReconnect();
            }, reconnectDelayMs);
          };

          reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            void runReconnect();
          }, reconnectDelayMs);
        };

        return {
          ...mongoOptions,
          retryAttempts: Number(process.env.MONGO_RETRY_ATTEMPTS ?? 6),
          retryDelay: Number(process.env.MONGO_RETRY_DELAY_MS ?? 3000),
          connectionFactory: (connection: Connection) => {
            connection.on('connected', () => {
              mongoLog.log('Connected');
              reconnectInFlight = false;
              if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
              }
            });
            connection.on('reconnected', () => {
              mongoLog.log('Reconnected');
              reconnectInFlight = false;
              if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
              }
            });
            connection.on('error', (error: unknown) => {
              const message =
                error instanceof Error ? error.message : String(error);
              mongoLog.error(`Error: ${message}`);
            });
            connection.on('disconnected', () => {
              mongoLog.error('Disconnected');
              scheduleReconnect(connection);
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
    MediaModule,
    InstagramModule,
    ContactModule,
    ServicesContentModule,
    AboutContentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
