import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { RefreshTokenDocument } from './schemas/refresh-token.schema';
import { ConfigService } from '@nestjs/config';
export declare class RefreshTokensService {
    private configService;
    private jwt;
    private model;
    private readonly refreshSecret;
    private readonly refreshExpiresIn;
    constructor(configService: ConfigService, jwt: JwtService, model: Model<RefreshTokenDocument>);
    private cookieOptions;
    generate(userId: string, accountType: 'user' | 'serveur', meta?: {
        ua?: string;
        ip?: string;
    }): Promise<{
        token: string;
        expiresAt: Date;
        cookie: {
            httpOnly: boolean;
            secure: boolean;
            sameSite: "none" | "lax";
            domain: any;
            path: string;
            expires: Date;
        };
    }>;
    verifyAndRotate(oldToken: string, userIdHint?: string, expectedAccountType?: 'user' | 'serveur', meta?: {
        ua?: string;
        ip?: string;
    }): Promise<{
        newToken: string;
        userId: string;
        expiresAt: Date;
        cookie: {
            httpOnly: boolean;
            secure: boolean;
            sameSite: "none" | "lax";
            domain: any;
            path: string;
            expires: Date;
        };
        accountType: "serveur" | "user";
    }>;
    revoke(token: string): Promise<void>;
    revokeAllForUser(userId: string, accountType?: 'user' | 'serveur'): Promise<void>;
    cookieOptionsPublic(expiresAt: Date): {
        httpOnly: boolean;
        secure: boolean;
        sameSite: "none" | "lax";
        domain: any;
        path: string;
        expires: Date;
    };
}
