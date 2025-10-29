import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Timesheet, TimesheetSchema } from "./entities/timesheet.entity";
import { ParticipationModule } from "src/participation/participation.module";
import { EventsModule } from "src/events/events.module";
import { TimesheetsController } from "./timesheets.controller";
import { TimesheetsService } from "./timesheets.service";
import { Event, EventSchema } from "src/events/entities/event.entity";
import { Participation, ParticipationSchema } from "src/participation/entities/participation.entity";
import { ServeurModule } from "src/serveur/serveur.module";
import { NotificationsModule } from "src/notifications/notifications.module";

@Module({
    imports: [MongooseModule.forFeature([
        { name: Timesheet.name, schema: TimesheetSchema },
    ]),
    ParticipationModule,
    EventsModule,
    ServeurModule,
    NotificationsModule
    ],
    controllers: [ TimesheetsController ],
    providers: [ TimesheetsService ]
})
export class TimesheetsModule { }