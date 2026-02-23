import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { RefreshTokensService } from './refresh-tokens.service';
import { ConfigService } from '@nestjs/config';
import { ServeurDocument } from 'src/serveur/entities/serveur.entity';
export declare class ServeurAuthService {
    private config;
    private jwt;
    private serveurs;
    private readonly rts;
    constructor(config: ConfigService, jwt: JwtService, serveurs: Model<ServeurDocument>, rts: RefreshTokensService);
    private signToken;
    private validateServeur;
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
            role: string;
            nom: string;
            isActive: any;
            realm: string;
        };
    }>;
    me(serveurId: string): Promise<{
        sub: any;
        email: any;
        role: string;
        nom: string;
        isActive: any;
        realm: string;
    }>;
}
