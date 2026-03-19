import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshTokensService } from './refresh-tokens.service';
import { ConfigService } from '@nestjs/config';
import { Serveur, ServeurDocument } from 'src/serveur/entities/serveur.entity';
import type { StringValue } from 'ms';

type ServeurAuthLike = {
  id?: string;
  _id?: unknown;
  email: string;
  prenom?: string;
  nom?: string;
  isActive?: boolean;
  mot_passe?: string;
};

type ServeurTokenPayload = {
  sub: string;
  email: string;
  role: 'serveur';
  nom: string;
  isActive?: boolean;
  realm: 'serveur';
};

function toStringValue(
  value: string | number | undefined,
): number | StringValue | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim()) return value as StringValue;
  return undefined;
}

@Injectable()
export class ServeurAuthService {
  constructor(
    private config: ConfigService,
    private jwt: JwtService,
    @InjectModel(Serveur.name) private serveurs: Model<ServeurDocument>,
    private readonly rts: RefreshTokensService,
  ) {}

  private signToken(serveur: ServeurAuthLike) {
    const accessSecret = this.config.get<string>('auth.accessToken');
    if (!accessSecret) {
      throw new UnauthorizedException('Access token secret is not configured');
    }

    const payload: ServeurTokenPayload = {
      sub: serveur.id?.toString() ?? String(serveur._id),
      email: serveur.email,
      role: 'serveur',
      nom: `${serveur.prenom ?? ''} ${serveur.nom ?? ''}`.trim(),
      isActive: serveur.isActive,
      realm: 'serveur',
    };

    return {
      access_token: this.jwt.sign(payload, {
        secret: accessSecret,
        expiresIn: toStringValue(
          this.config.get<string | number>('auth.accessIn') ?? '20m',
        ),
      }),
      user: payload,
    };
  }

  private async validateServeur(
    email: string,
    mot_passe: string,
  ): Promise<ServeurAuthLike> {
    const doc = await this.serveurs
      .findOne({ email })
      .select('+mot_passe')
      .lean(false);
    if (!doc) throw new UnauthorizedException('Email ou mot de passe invalide');

    const withPassword = doc as ServeurDocument & { mot_passe: string };
    const ok = await bcrypt.compare(mot_passe, withPassword.mot_passe);
    if (!ok) throw new UnauthorizedException('Mot de passe invalide');
    if (doc.isActive === false)
      throw new UnauthorizedException('Compte inactif');

    const raw = doc.toObject<ServeurAuthLike>();
    if (!raw.email) {
      throw new UnauthorizedException('Serveur invalide');
    }

    return {
      _id: raw._id,
      email: raw.email,
      prenom: raw.prenom,
      nom: raw.nom,
      isActive: raw.isActive,
    };
  }

  async login(
    email: string,
    mot_passe: string,
    meta?: { ua?: string; ip?: string },
  ) {
    const serveur = await this.validateServeur(email, mot_passe);
    const at = this.signToken(serveur);
    const rt = await this.rts.generate(at.user.sub, 'serveur', meta);
    return { ...at, refresh_token: rt.token, refresh_expires_at: rt.expiresAt };
  }

  async me(serveurId: string) {
    const s = await this.serveurs.findById(serveurId).lean();
    if (!s) throw new UnauthorizedException('Serveur introuvable');
    if (!s.email) throw new UnauthorizedException('Serveur invalide');

    const at = this.signToken({
      _id: s._id,
      email: s.email,
      prenom: s.prenom,
      nom: s.nom,
      isActive: s.isActive,
    });
    return at.user;
  }
}
