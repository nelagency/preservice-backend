import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { JwtModule } from '@nestjs/jwt';
import { Serveur, ServeurSchema } from 'src/serveur/entities/serveur.entity';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { EventSchema } from 'src/events/entities/event.entity';
import { Timesheet, TimesheetSchema } from 'src/timesheets/entities/timesheet.entity';
import { MailModule } from 'src/mail/mail.module';
import { EmailModule } from 'src/email/email.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Notification.name, schema: NotificationSchema },
            { name: Serveur.name, schema: ServeurSchema },
            { name: User.name, schema: UserSchema },
            { name: Event.name, schema: EventSchema },
            { name: Timesheet.name, schema: TimesheetSchema },
        ]),
        MailModule,
        EmailModule,
        JwtModule.register({
            secret: process.env.ACCESS_JWT_SECRET,
            signOptions: { expiresIn: '15m' },
        }),
    ],
    controllers: [NotificationsController],
    providers: [NotificationsService, NotificationsGateway],
    exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule { }