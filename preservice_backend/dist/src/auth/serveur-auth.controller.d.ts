import type { Request } from 'express';
import { ServeurAuthService } from './serveur-auth.service';
import { ConfigService } from '@nestjs/config';
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
    constructor(auth: ServeurAuthService, configService: ConfigService);
    login(dto: ServeurLoginDto, req: AuthRequest): Promise<{
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
    me(req: AuthRequest): (Express.User & ServeurAuthUser) | {
        error: string;
    };
}
export {};
