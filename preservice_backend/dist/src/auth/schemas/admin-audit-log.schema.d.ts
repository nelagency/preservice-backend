import { Document, Types } from 'mongoose';
export type AdminAuditLogDocument = AdminAuditLog & Document;
export declare class AdminAuditLog {
    userId?: Types.ObjectId;
    email?: string;
    event: string;
    status: 'success' | 'failure' | 'pending';
    role?: string;
    ip?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
    createdAt?: Date;
}
export declare const AdminAuditLogSchema: import("mongoose").Schema<AdminAuditLog, import("mongoose").Model<AdminAuditLog, any, any, any, Document<unknown, any, AdminAuditLog, any, {}> & AdminAuditLog & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AdminAuditLog, Document<unknown, {}, import("mongoose").FlatRecord<AdminAuditLog>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AdminAuditLog> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
