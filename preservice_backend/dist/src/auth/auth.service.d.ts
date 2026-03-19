import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserDocument, UserRole } from 'src/users/entities/user.entity';
import { RefreshTokensService } from './refresh-tokens.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { AdminAuditLogService } from './admin-audit-log.service';
type AuthUserLike = {
    id?: string;
    _id?: unknown;
    email: string;
    role: UserRole | string;
    nom?: string;
    isActive?: boolean;
    mot_passe?: string;
    twoFactorEnabled?: boolean;
};
type AuthTokenPayload = {
    sub: string;
    email: string;
    role: UserRole | string;
    realm: 'user';
    nom?: string;
    isActive?: boolean;
};
export declare class AuthService {
    private configService;
    private jwt;
    private users;
    private readonly rts;
    private readonly mail;
    private readonly auditLogs;
    private readonly logger;
    constructor(configService: ConfigService, jwt: JwtService, users: Model<UserDocument>, rts: RefreshTokensService, mail: MailService, auditLogs: AdminAuditLogService);
    private signToken;
    private ensureAdminIpAllowed;
    private logAdminAccess;
    validateUser(email: string, mot_passe: string): Promise<AuthUserLike>;
    login(email: string, mot_passe: string, meta?: {
        ua?: string;
        ip?: string;
    }): Promise<{
        refresh_token: string;
        refresh_expires_at: Date;
        access_token: string;
        user: AuthTokenPayload;
    }>;
    register(data: {
        nom: string;
        email: string;
        numero_tel: string;
        adresse?: string;
        mot_passe: string;
        role?: UserRole;
    }, meta?: {
        ua?: string;
        ip?: string;
    }): Promise<{
        refresh_token: string;
        refresh_expires_at: Date;
        access_token: string;
        user: AuthTokenPayload;
    }>;
    refresh(oldRefreshToken: string, userIdHint?: string, meta?: {
        ua?: string;
        ip?: string;
    }): Promise<{
        refresh_token: string;
        refresh_expires_at: Date;
        cookie: {
            httpOnly: boolean;
            secure: boolean;
            sameSite: "none" | "lax";
            domain: string | undefined;
            path: string;
            expires: Date;
        };
        access_token: string;
        user: AuthTokenPayload;
    }>;
    findUserForTwoFactor(userId: string): Promise<AuthUserLike & {
        twoFactorEnabled?: boolean;
    }>;
    completeTwoFactorLogin(userId: string, meta?: {
        ua?: string;
        ip?: string;
    }): Promise<{
        refresh_token: string;
        refresh_expires_at: Date;
        access_token: string;
        user: AuthTokenPayload;
    }>;
    requestPasswordReset(email: string): Promise<{
        success: boolean;
        message: string;
        reset_link_preview?: undefined;
    } | {
        success: boolean;
        message: string;
        reset_link_preview: string | undefined;
    }>;
    resetPassword(resetToken: string, newPassword: string): Promise<{
        success: boolean;
    }>;
}
export {};
