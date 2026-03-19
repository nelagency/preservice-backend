import type { Request, Response } from 'express';
import { ServeurAuthService } from './serveur-auth.service';
import { ConfigService } from '@nestjs/config';
import { AuthRateLimitService } from './auth-rate-limit.service';
declare class ServeurLoginDto {
    email: string;
    mot_passe: string;
}
declare class ServeurAuthUser {
    sub: string;
    email: string;
    role: 'serveur';
    nom?: string;
    isActive?: boolean;
    realm: 'serveur';
}
type AuthRequest = Request & {
    user?: ServeurAuthUser;
};
export declare class ServeurAuthController {
    private readonly auth;
    private readonly configService;
    private readonly authRateLimit;
    constructor(auth: ServeurAuthService, configService: ConfigService, authRateLimit: AuthRateLimitService);
    private setRefreshCookie;
    login(dto: ServeurLoginDto, req: AuthRequest, res: Response): Promise<{
        redirectTo: string;
        refresh_token: string;
        refresh_expires_at: Date;
        access_token: string;
        user: {
            sub: string;
            email: string;
            role: "serveur";
            nom: string;
            isActive?: boolean;
            realm: "serveur";
        };
    }>;
    me(req: AuthRequest): Express.User & ServeurAuthUser;
    refresh(req: AuthRequest, res: Response): Promise<{
        refresh_token: string;
        refresh_expires_at: Date;
        access_token: string;
        user: {
            sub: string;
            email: string;
            role: "serveur";
            nom: string;
            isActive?: boolean;
            realm: "serveur";
        };
    }>;
}
export {};
