import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserDocument, UserRole } from 'src/users/entities/user.entity';
import { AdminAuditLogService } from './admin-audit-log.service';
export declare class TwoFactorService {
    private readonly configService;
    private readonly jwt;
    private readonly users;
    private readonly auditLogs;
    constructor(configService: ConfigService, jwt: JwtService, users: Model<UserDocument>, auditLogs: AdminAuditLogService);
    private getEncryptionKey;
    private encryptSecret;
    private decryptSecret;
    private assertAdminRole;
    private sanitizeCode;
    private findAdminUserById;
    getStatus(userId: string): Promise<{
        enabled: boolean;
        pendingSetup: boolean;
    }>;
    beginSetup(userId: string, meta?: {
        ip?: string;
        ua?: string;
    }): Promise<{
        manualEntryKey: string;
        otpauthUrl: string;
        qrCodeDataUrl: any;
    }>;
    enable(userId: string, code: string, meta?: {
        ip?: string;
        ua?: string;
    }): Promise<{
        success: boolean;
    }>;
    disable(userId: string, code: string, meta?: {
        ip?: string;
        ua?: string;
    }): Promise<{
        success: boolean;
    }>;
    requiresTwoFactor(user?: {
        role?: UserRole | string;
        twoFactorEnabled?: boolean;
    }): boolean;
    createLoginChallenge(user: {
        _id?: unknown;
        email: string;
        role: UserRole | string;
    }, meta?: {
        ip?: string;
        ua?: string;
    }): Promise<{
        requiresTwoFactor: true;
        twoFactorToken: string;
        message: string;
    }>;
    verifyLoginChallenge(challengeToken: string, code: string, meta?: {
        ip?: string;
        ua?: string;
    }): Promise<{
        userId: string;
        email: string;
        role: UserRole.admin | UserRole.superadmin;
    }>;
}
