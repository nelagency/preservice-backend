import { Document, Types } from 'mongoose';
export type TimesheetDocument = Timesheet & Document;
export type TimesheetStatus = 'submitted' | 'approved' | 'rejected';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export declare class TsPayment {
    amount: number;
    note?: string;
    createdBy: Types.ObjectId;
    createdAt: Date;
}
export declare const TsPaymentSchema: import("mongoose").Schema<TsPayment, import("mongoose").Model<TsPayment, any, any, any, Document<unknown, any, TsPayment, any, {}> & TsPayment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TsPayment, Document<unknown, {}, import("mongoose").FlatRecord<TsPayment>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<TsPayment> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class Timesheet {
    event: Types.ObjectId;
    serveur: Types.ObjectId;
    startAt: Date;
    endAt: Date;
    breakMinutes: number;
    workedMinutes: number;
    status: TimesheetStatus;
    note?: string;
    validatedBy?: Types.ObjectId;
    validatedAt?: Date;
    validationComment?: string;
    paidAmount: number;
    paymentStatus: PaymentStatus;
    payments: TsPayment[];
    paidAt?: Date;
    paidBy?: Types.ObjectId;
}
export declare const TimesheetSchema: import("mongoose").Schema<Timesheet, import("mongoose").Model<Timesheet, any, any, any, Document<unknown, any, Timesheet, any, {}> & Timesheet & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Timesheet, Document<unknown, {}, import("mongoose").FlatRecord<Timesheet>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Timesheet> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
