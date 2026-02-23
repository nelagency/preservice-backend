import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserDocument, UserRole } from 'src/users/entities/user.entity';
import { RefreshTokensService } from './refresh-tokens.service';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private configService;
    private jwt;
    private users;
    private readonly rts;
    constructor(configService: ConfigService, jwt: JwtService, users: Model<UserDocument>, rts: RefreshTokensService);
    private signToken;
    validateUser(email: string, mot_passe: string): Promise<import("mongoose").FlattenMaps<any>>;
    login(email: string, mot_passe: string, meta?: {
        ua?: string;
        ip?: string;
    }): Promise<{
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
        user: {
            sub: any;
            email: any;
            role: any;
            nom: any;
            isActive: any;
        };
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
            domain: any;
            path: string;
            expires: Date;
        };
        access_token: string;
        user: {
            sub: any;
            email: any;
            role: any;
            nom: any;
            isActive: any;
        };
    }>;
}
