import { Model } from 'mongoose';
import { Timesheet, TimesheetDocument } from './entities/timesheet.entity';
import { ReviewTimesheetDto } from './dto/review-timesheet.dto';
import { EventDocument } from '../events/entities/event.entity';
import { ParticipationDocument } from 'src/participation/entities/participation.entity';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { ServeurDocument } from 'src/serveur/entities/serveur.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PayTimesheetDto } from './dto/pay-timesheet.dto';
export declare class TimesheetsService {
    private tsModel;
    private eventModel;
    private serveurModel;
    private partModel;
    private readonly notifications;
    constructor(tsModel: Model<TimesheetDocument>, eventModel: Model<EventDocument>, serveurModel: Model<ServeurDocument>, partModel: Model<ParticipationDocument>, notifications: NotificationsService);
    private computeWorkedMinutes;
    submitForEvent(eventId: string, serveurId: string, dto: CreateTimesheetDto): Promise<import("mongoose").Document<unknown, {}, TimesheetDocument, {}, {}> & Timesheet & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    getMineForEvent(eventId: string, serveurId: string): Promise<import("mongoose").Document<unknown, {}, TimesheetDocument, {}, {}> & Timesheet & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    listPending(): Promise<(import("mongoose").FlattenMaps<TimesheetDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    review(timesheetId: string, reviewerId: string, body: ReviewTimesheetDto): Promise<import("mongoose").Document<unknown, {}, TimesheetDocument, {}, {}> & Timesheet & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    listForEvent(eventId: string): Promise<(import("mongoose").FlattenMaps<TimesheetDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    listForServeur(serveurId: string): Promise<(import("mongoose").FlattenMaps<TimesheetDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    listForServeurSmart(userOrServeurId: string): Promise<(import("mongoose").FlattenMaps<TimesheetDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    pay(timesheetId: string, adminId: string, dto: PayTimesheetDto): Promise<import("mongoose").Document<unknown, {}, TimesheetDocument, {}, {}> & Timesheet & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
}
