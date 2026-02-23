import type { Response } from 'express';
import { ServeurAuthService } from './serveur-auth.service';
declare class ServeurLoginDto {
    email: string;
    mot_passe: string;
}
export declare class ServeurAuthController {
    private readonly auth;
    constructor(auth: ServeurAuthService);
    login(dto: ServeurLoginDto, req: any, res: Response): Promise<{
        refresh_token: string;
        refresh_expires_at: Date;
        access_token: string;
        user: {
            sub: any;
            email: any;
            role: string;
            nom: string;
            isActive: any;
            realm: string;
        };
    }>;
    me(req: any): Promise<any>;
}
export {};
