// auth/serveur-auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshTokensService } from './refresh-tokens.service';
import { ConfigService } from '@nestjs/config';
import { Serveur, ServeurDocument } from 'src/serveur/entities/serveur.entity';

@Injectable()
export class ServeurAuthService {
    constructor(
        private config: ConfigService,
        private jwt: JwtService,
        @InjectModel(Serveur.name) private serveurs: Model<ServeurDocument>,
        private readonly rts: RefreshTokensService,
    ) { }

    private signToken(serveur: any) {
        const payload = {
            sub: serveur.id?.toString() ?? serveur._id?.toString(),
            email: serveur.email,
            role: 'serveur',              // <- important
            nom: `${serveur.prenom} ${serveur.nom}`,
            isActive: serveur.isActive,
            realm: 'serveur',             // <- pour distinguer côté guards
        };
        return {
            access_token: this.jwt.sign(payload, {
                secret: this.config.get('auth.accessToken'),
                expiresIn: this.config.get('auth.accessIn'),
            }),
            user: payload,
        };
    }

    private async validateServeur(email: string, mot_passe: string) {
        const doc = await this.serveurs.findOne({ email }).select('+mot_passe').lean(false);
        if (!doc) throw new UnauthorizedException('Email ou mot de passe invalide');
        const ok = await bcrypt.compare(mot_passe, (doc as any).mot_passe);
        if (!ok) throw new UnauthorizedException('Mot de passe invalide');
        if (doc.isActive === false) throw new UnauthorizedException('Compte inactif');
        return doc.toJSON();
    }

    async login(email: string, mot_passe: string, meta?: { ua?: string; ip?: string }) {
        const serveur = await this.validateServeur(email, mot_passe);
        const at = this.signToken(serveur);
        const rt = await this.rts.generate(at.user.sub, 'serveur', meta); // tu peux aussi marquer le "type"
        return { ...at, refresh_token: rt.token, refresh_expires_at: rt.expiresAt };
    }

    async me(serveurId: string) {
        const s = await this.serveurs.findById(serveurId).lean();
        if (!s) throw new UnauthorizedException('Serveur introuvable');
        const at = this.signToken(s);
        return at.user;
    }
}
