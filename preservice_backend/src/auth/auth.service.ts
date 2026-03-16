import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from 'src/users/entities/user.entity';
import { RefreshTokensService } from './refresh-tokens.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import type { StringValue } from 'ms';

type AuthUserLike = {
  id?: string;
  _id?: unknown;
  email: string;
  role: UserRole | string;
  nom?: string;
  isActive?: boolean;
  mot_passe?: string;
};

type AuthTokenPayload = {
  sub: string;
  email: string;
  role: UserRole | string;
  realm: 'user';
  nom?: string;
  isActive?: boolean;
};

type ResetPayload = { sub?: string; typ?: string };

function asIdString(id: unknown): string {
  if (typeof id === 'string') return id;
  if (id instanceof Types.ObjectId) return id.toHexString();
  if (id && typeof id === 'object' && 'toString' in id) {
    const maybe = (id as { toString: () => string }).toString();
    if (maybe && maybe !== '[object Object]') return maybe;
  }
  return '';
}

function toStringValue(
  value: string | number | undefined,
): number | StringValue | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim()) return value as StringValue;
  return undefined;
}

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwt: JwtService,
    @InjectModel(User.name) private users: Model<UserDocument>,
    private readonly rts: RefreshTokensService,
    private readonly mail: MailService,
  ) {}

  private signToken(user: AuthUserLike) {
    const ACCESS_SECRET = this.configService.get<string>('auth.accessToken');
    if (!ACCESS_SECRET) {
      throw new UnauthorizedException('Access token secret is not configured');
    }

    const payload: AuthTokenPayload = {
      sub: user.id?.toString() ?? asIdString(user._id),
      email: user.email,
      role: user.role,
      realm: 'user',
      nom: user.nom,
      isActive: user.isActive,
    };
    const ACCESS_EXPIRES_IN = toStringValue(
      this.configService.get<string | number>('auth.accessIn'),
    );
    return {
      access_token: this.jwt.sign(payload, {
        secret: ACCESS_SECRET,
        expiresIn: ACCESS_EXPIRES_IN,
      }),
      user: payload,
    };
  }

  async validateUser(email: string, mot_passe: string): Promise<AuthUserLike> {
    const doc = await this.users
      .findOne({ email })
      .select('+mot_passe')
      .lean(false);
    if (!doc) throw new UnauthorizedException('Email ou mot de passe invalide');

    const withPassword = doc as UserDocument & { mot_passe: string };
    const ok = await bcrypt.compare(mot_passe, withPassword.mot_passe);
    if (!ok) throw new UnauthorizedException('Mot de passe invalide');
    if (doc.isActive === false)
      throw new UnauthorizedException('Compte inactif');

    const raw = doc.toObject<AuthUserLike>();
    if (!raw.email || !raw.role) {
      throw new UnauthorizedException('Utilisateur invalide');
    }
    return {
      _id: raw._id,
      email: raw.email,
      role: raw.role,
      nom: raw.nom,
      isActive: raw.isActive,
    };
  }

  async login(
    email: string,
    mot_passe: string,
    meta?: { ua?: string; ip?: string },
  ) {
    const user = await this.validateUser(email, mot_passe);
    const tokenUser: AuthUserLike = {
      _id: user._id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      isActive: user.isActive,
    };

    const at = this.signToken(tokenUser);
    const rt = await this.rts.generate(at.user.sub, 'user', meta);
    return { ...at, refresh_token: rt.token, refresh_expires_at: rt.expiresAt };
  }

  async register(
    data: {
      nom: string;
      email: string;
      numero_tel: string;
      adresse?: string;
      mot_passe: string;
      role?: UserRole;
    },
    meta?: { ua?: string; ip?: string },
  ) {
    const exists = await this.users.exists({ email: data.email });
    if (exists) throw new UnauthorizedException('Email deja utilise');

    const created = new this.users(data);
    await created.save();
    const user = created.toObject<AuthUserLike>();
    if (!user.email || !user.role) {
      throw new UnauthorizedException('Utilisateur invalide');
    }

    const tokenUser: AuthUserLike = {
      _id: user._id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      isActive: user.isActive,
    };

    const at = this.signToken(tokenUser);
    const rt = await this.rts.generate(at.user.sub, 'user', meta);
    return { ...at, refresh_token: rt.token, refresh_expires_at: rt.expiresAt };
  }

  async refresh(
    oldRefreshToken: string,
    userIdHint?: string,
    meta?: { ua?: string; ip?: string },
  ) {
    const { newToken, userId, expiresAt, cookie } =
      await this.rts.verifyAndRotate(oldRefreshToken, userIdHint, 'user', meta);
    const userDoc = await this.users.findById(userId).lean();
    if (!userDoc) throw new UnauthorizedException('Utilisateur introuvable');
    if (!userDoc.email || !userDoc.role) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }
    const at = this.signToken({
      _id: userDoc._id,
      email: userDoc.email,
      role: userDoc.role,
      nom: userDoc.nom,
      isActive: userDoc.isActive,
    });
    return {
      ...at,
      refresh_token: newToken,
      refresh_expires_at: expiresAt,
      cookie,
    };
  }

  async requestPasswordReset(email: string) {
    const user = await this.users
      .findOne({ email: email.toLowerCase().trim() })
      .lean();
    if (!user) {
      return {
        success: true,
        message:
          'Si un compte existe, un lien de reinitialisation a ete envoye.',
      };
    }

    const secret =
      process.env.PASSWORD_RESET_SECRET ||
      this.configService.get<string>('auth.refreshToken') ||
      this.configService.get<string>('auth.accessToken');
    if (!secret)
      throw new UnauthorizedException(
        'Reset password secret is not configured',
      );

    const expiresIn = process.env.PASSWORD_RESET_EXPIRES_IN || '15m';
    const token = this.jwt.sign(
      { sub: asIdString(user._id), typ: 'pwd_reset' },
      { secret, expiresIn: expiresIn as StringValue },
    );

    const frontendBase = (
      process.env.FRONTEND_BASE_URL || 'http://localhost:3001'
    ).replace(/\/$/, '');
    const link = `${frontendBase}/reset-password?token=${encodeURIComponent(token)}`;

    await this.mail.generic(user.email, 'Reinitialisation du mot de passe', {
      intro: 'Vous avez demande une reinitialisation de mot de passe.',
      details: { Expiration: expiresIn },
      ctaLabel: 'Reinitialiser mon mot de passe',
      ctaHref: link,
      outro:
        'Si vous n etes pas a l origine de cette demande, ignorez cet email.',
    });

    return {
      success: true,
      message: 'Si un compte existe, un lien de reinitialisation a ete envoye.',
      reset_link_preview:
        process.env.NODE_ENV === 'production' ? undefined : link,
    };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    const secret =
      process.env.PASSWORD_RESET_SECRET ||
      this.configService.get<string>('auth.refreshToken') ||
      this.configService.get<string>('auth.accessToken');
    if (!secret)
      throw new UnauthorizedException(
        'Reset password secret is not configured',
      );

    let payload: ResetPayload;
    try {
      payload = this.jwt.verify(resetToken, { secret });
    } catch {
      throw new UnauthorizedException(
        'Token de reinitialisation invalide ou expire',
      );
    }

    if (payload?.typ !== 'pwd_reset' || !payload?.sub) {
      throw new UnauthorizedException('Token de reinitialisation invalide');
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    const updated = await this.users
      .findByIdAndUpdate(payload.sub, { mot_passe: hashed }, { new: true })
      .lean();
    if (!updated) throw new UnauthorizedException('Utilisateur introuvable');

    await this.rts.revokeAllForUser(payload.sub, 'user');
    return { success: true };
  }
}
