import { TimesheetsService } from './timesheets.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { ReviewTimesheetDto } from './dto/review-timesheet.dto';
import { PayTimesheetDto } from './dto/pay-timesheet.dto';
export declare class TimesheetsController {
    private readonly svc;
    constructor(svc: TimesheetsService);
    submit(eventId: string, req: any, dto: CreateTimesheetDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/timesheet.entity").TimesheetDocument, {}, {}> & import("./entities/timesheet.entity").Timesheet & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    mine(eventId: string, req: any): Promise<import("mongoose").Document<unknown, {}, import("./entities/timesheet.entity").TimesheetDocument, {}, {}> & import("./entities/timesheet.entity").Timesheet & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    pending(status?: string): Promise<(import("mongoose").FlattenMaps<import("./entities/timesheet.entity").TimesheetDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    review(id: string, req: any, body: ReviewTimesheetDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/timesheet.entity").TimesheetDocument, {}, {}> & import("./entities/timesheet.entity").Timesheet & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    payOne(id: string, req: any, body: PayTimesheetDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/timesheet.entity").TimesheetDocument, {}, {}> & import("./entities/timesheet.entity").Timesheet & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    myHistory(req: any): Promise<(import("mongoose").FlattenMaps<import("./entities/timesheet.entity").TimesheetDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    eventHistory(eventId: string): Promise<(import("mongoose").FlattenMaps<import("./entities/timesheet.entity").TimesheetDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
}
