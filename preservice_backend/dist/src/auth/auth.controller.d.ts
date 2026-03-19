import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { RefreshTokensService } from './refresh-tokens.service';
import { ConfigService } from '@nestjs/config';
import { UserRole } from 'src/users/entities/user.entity';
import { TwoFactorService } from './two-factor.service';
import { AdminAuditLogService } from './admin-audit-log.service';
import { AuthRateLimitService } from './auth-rate-limit.service';
declare class LoginDto {
    email: string;
    mot_passe: string;
}
declare class RegisterDto {
    nom: string;
    email: string;
    numero_tel?: string;
    mot_passe?: string;
    mot_de_passe?: string;
    adresse?: string;
    role?: string;
    telephone?: string;
}
declare class ForgotPasswordDto {
    email: string;
}
declare class ResetPasswordDto {
    token: string;
    new_password: string;
}
declare class TwoFactorCodeDto {
    code: string;
}
declare class VerifyTwoFactorLoginDto extends TwoFactorCodeDto {
    twoFactorToken: string;
}
type AuthReqUser = {
    sub?: string;
    exp?: number;
    role?: 'user' | 'admin' | 'superadmin' | 'serveur';
    realm?: 'user' | 'serveur';
};
type AuthRequest = Request & {
    user?: AuthReqUser;
};
export declare class AuthController {
    private readonly configService;
    private readonly auth;
    private readonly blacklist;
    private readonly rts;
    private readonly twoFactor;
    private readonly adminAuditLogs;
    private readonly authRateLimit;
    private readonly logger;
    constructor(configService: ConfigService, auth: AuthService, blacklist: TokenBlacklistService, rts: RefreshTokensService, twoFactor: TwoFactorService, adminAuditLogs: AdminAuditLogService, authRateLimit: AuthRateLimitService);
    private setRefreshCookie;
    private clearRefreshCookie;
    login(dto: LoginDto, req: AuthRequest, res: Response): Promise<{
        requiresTwoFactor: true;
        twoFactorToken: string;
        message: string;
    } | {
        redirectTo: string;
        refresh_token: string;
        refresh_expires_at: Date;
        access_token: string;
        user: {
            sub: string;
            email: string;
            role: UserRole | string;
            realm: "user";
            nom?: string;
            isActive?: boolean;
        };
    }>;
    verifyTwoFactorLogin(dto: VerifyTwoFactorLoginDto, req: AuthRequest, res: Response): Promise<{
        redirectTo: string;
        refresh_token: string;
        refresh_expires_at: Date;
        access_token: string;
        user: {
            sub: string;
            email: string;
            role: UserRole | string;
            realm: "user";
            nom?: string;
            isActive?: boolean;
        };
    }>;
    register(dto: RegisterDto, req: AuthRequest, res: Response): Promise<{
        redirectTo: string;
        refresh_token: string;
        refresh_expires_at: Date;
        access_token: string;
        user: {
            sub: string;
            email: string;
            role: UserRole | string;
            realm: "user";
            nom?: string;
            isActive?: boolean;
        };
    }>;
    me(req: AuthRequest): (Express.User & AuthReqUser) | undefined;
    refresh(req: AuthRequest, res: Response): Promise<{
        user: {
            sub: string;
            email: string;
            role: UserRole | string;
            realm: "user";
            nom?: string;
            isActive?: boolean;
        };
        access_token: string;
        refresh_token: string;
        refresh_expires_at: Date;
    }>;
    forgotPassword(dto: ForgotPasswordDto, req: AuthRequest): Promise<{
        success: boolean;
        message: string;
        reset_link_preview?: undefined;
    } | {
        success: boolean;
        message: string;
        reset_link_preview: string | undefined;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
    }>;
    twoFactorStatus(req: AuthRequest): Promise<{
        enabled: boolean;
        pendingSetup: boolean;
    }>;
    twoFactorSetup(req: AuthRequest): Promise<{
        manualEntryKey: string;
        otpauthUrl: string;
        qrCodeDataUrl: any;
    }>;
    twoFactorEnable(req: AuthRequest, dto: TwoFactorCodeDto): Promise<{
        success: boolean;
    }>;
    twoFactorDisable(req: AuthRequest, dto: TwoFactorCodeDto): Promise<{
        success: boolean;
    }>;
    getAdminAuditLogs(req: AuthRequest): Promise<(import("mongoose").FlattenMaps<import("./schemas/admin-audit-log.schema").AdminAuditLogDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    logout(req: AuthRequest, res: Response): Promise<{
        success: boolean;
    }>;
    logoutAll(req: AuthRequest, res: Response): Promise<{
        success: boolean;
    }>;
}
export {};
