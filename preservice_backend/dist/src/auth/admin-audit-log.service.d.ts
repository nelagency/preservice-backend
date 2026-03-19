import { Model } from 'mongoose';
import { AdminAuditLogDocument } from './schemas/admin-audit-log.schema';
type AuditPayload = {
    userId?: string;
    email?: string;
    event: string;
    status: 'success' | 'failure' | 'pending';
    role?: string;
    ip?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
};
export declare class AdminAuditLogService {
    private readonly model;
    private readonly logger;
    constructor(model: Model<AdminAuditLogDocument>);
    record(payload: AuditPayload): Promise<void>;
    list(limit?: number): Promise<(import("mongoose").FlattenMaps<AdminAuditLogDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
}
export {};
