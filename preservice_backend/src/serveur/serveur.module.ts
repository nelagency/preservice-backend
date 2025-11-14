import { Module } from '@nestjs/common';
import { ServeurService } from './serveur.service';
import { ServeurController } from './serveur.controller';
import { Serveur, ServeurSchema } from './entities/serveur.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from 'src/events/entities/event.entity';
import { Participation, ParticipationSchema } from 'src/participation/entities/participation.entity';
import { EventsModule } from 'src/events/events.module';
import { ParticipationModule } from 'src/participation/participation.module';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Serveur.name, schema: ServeurSchema },
  ]),
    EventsModule,
    ParticipationModule
  ],
  controllers: [ServeurController],
  providers: [ServeurService],
  exports: [MongooseModule],
})
export class ServeurModule { }
