import { Module } from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { ParticipationController } from './participation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Participation, ParticipationSchema } from './entities/participation.entity';
import { Event, EventSchema } from 'src/events/entities/event.entity';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Participation.name, schema: ParticipationSchema },
    { name: Event.name, schema: EventSchema },
  ])],
  controllers: [ParticipationController],
  providers: [ParticipationService],
})
export class ParticipationModule { }