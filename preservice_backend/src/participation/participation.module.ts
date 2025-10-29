import { Module } from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { ParticipationController } from './participation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Participation, ParticipationSchema } from './entities/participation.entity';
import { Event, EventSchema } from 'src/events/entities/event.entity';
import { MailModule } from 'src/mail/mail.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Participation.name, schema: ParticipationSchema },
    { name: Event.name, schema: EventSchema },
  ]),
    MailModule,
    NotificationsModule
  ],
  controllers: [ParticipationController],
  providers: [ParticipationService],
  exports: [MongooseModule]
})
export class ParticipationModule { }