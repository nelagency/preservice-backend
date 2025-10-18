import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env', load: [configuration]}),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN }
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
    StatsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})

export class AppModule { }
