import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ParticipationController } from './participation.controller';
import { ParticipationService } from './participation.service';
import { Participation } from './entities/participation.entity';
import { Event } from 'src/events/entities/event.entity';
import { MailService } from 'src/mail/mail.service';
import { NotificationsService } from 'src/notifications/notifications.service';

describe('ParticipationController', () => {
  let controller: ParticipationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipationController],
      providers: [
        ParticipationService,
        { provide: getModelToken(Participation.name), useValue: {} },
        { provide: getModelToken(Event.name), useValue: {} },
        { provide: MailService, useValue: {} },
        { provide: NotificationsService, useValue: {} },
      ],
    }).compile();

    controller = module.get<ParticipationController>(ParticipationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
