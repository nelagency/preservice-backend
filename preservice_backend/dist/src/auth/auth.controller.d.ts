import type { Response } from 'express';
import { AuthService } from './auth.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { RefreshTokensService } from './refresh-tokens.service';
import { ConfigService } from '@nestjs/config';
declare class LoginDto {
    email: string;
    mot_passe: string;
}
declare class RegisterDto {
    nom: string;
    email: string;
    numero_tel: string;
    mot_passe: string;
    adresse?: string;
    role?: string;
}
export declare class AuthController {
    private readonly configService;
    private readonly auth;
    private readonly blacklist;
    private readonly rts;
    constructor(configService: ConfigService, auth: AuthService, blacklist: TokenBlacklistService, rts: RefreshTokensService);
    private setRefreshCookie;
    private clearRefreshCookie;
    login(dto: LoginDto, req: any, res: Response): Promise<{
        refresh_token: string;
        refresh_expires_at: Date;
        access_token: string;
        user: {
            sub: any;
            email: any;
            role: any;
            nom: any;
            isActive: any;
        };
    }>;
    register(dto: RegisterDto, req: any, res: Response): Promise<{
        refresh_token: string;
        refresh_expires_at: Date;
        access_token: string;
        user: {
            sub: any;
            email: any;
            role: any;
            nom: any;
            isActive: any;
        };
    }>;
    me(req: any): any;
    refresh(req: any, res: Response): Promise<{
        error: string;
        user?: undefined;
        access_token?: undefined;
        refresh_token?: undefined;
        refresh_expires_at?: undefined;
    } | {
        user: {
            sub: any;
            email: any;
            role: any;
            nom: any;
            isActive: any;
        };
        access_token: string;
        refresh_token: string;
        refresh_expires_at: Date;
        error?: undefined;
    }>;
    logout(req: any, res: Response): Promise<{
        success: boolean;
    }>;
    logoutAll(req: any, res: Response): Promise<{
        success: boolean;
    }>;
}
export {};
