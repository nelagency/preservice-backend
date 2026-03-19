import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AdminAuditLog,
  AdminAuditLogDocument,
} from './schemas/admin-audit-log.schema';
import { normalizeIp } from 'src/common/security.utils';

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

@Injectable()
export class AdminAuditLogService {
  private readonly logger = new Logger(AdminAuditLogService.name);

  constructor(
    @InjectModel(AdminAuditLog.name)
    private readonly model: Model<AdminAuditLogDocument>,
  ) {}

  async record(payload: AuditPayload) {
    try {
      await this.model.create({
        userId: payload.userId ? new Types.ObjectId(payload.userId) : undefined,
        email: payload.email,
        event: payload.event,
        status: payload.status,
        role: payload.role,
        ip: normalizeIp(payload.ip),
        userAgent: payload.userAgent,
        metadata: payload.metadata ?? {},
      });
    } catch (error) {
      this.logger.warn(
        `Failed to persist admin audit log for ${payload.event}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async list(limit = 50) {
    const normalizedLimit = Math.min(Math.max(limit, 1), 200);
    return this.model.find().sort({ createdAt: -1 }).limit(normalizedLimit).lean();
  }
}
