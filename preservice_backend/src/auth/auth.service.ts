import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from 'src/users/entities/user.entity';
import { RefreshTokensService } from './refresh-tokens.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import type { StringValue } from 'ms';
import { isAllowedAdminIp, normalizeIp } from 'src/common/security.utils';
import { AdminAuditLogService } from './admin-audit-log.service';

type AuthUserLike = {
  id?: string;
  _id?: unknown;
  email: string;
  role: UserRole | string;
  nom?: string;
  isActive?: boolean;
  mot_passe?: string;
  twoFactorEnabled?: boolean;
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
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private configService: ConfigService,
    private jwt: JwtService,
    @InjectModel(User.name) private users: Model<UserDocument>,
    private readonly rts: RefreshTokensService,
    private readonly mail: MailService,
    private readonly auditLogs: AdminAuditLogService,
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
      this.configService.get<string | number>('auth.accessIn') ?? '20m',
    );
    return {
      access_token: this.jwt.sign(payload, {
        secret: ACCESS_SECRET,
        expiresIn: ACCESS_EXPIRES_IN,
      }),
      user: payload,
    };
  }

  private ensureAdminIpAllowed(user: AuthUserLike, ip?: string) {
    if (!ip) return;
    if (user.role !== UserRole.admin && user.role !== UserRole.superadmin) {
      return;
    }

    const normalizedIp = normalizeIp(ip);
    if (!isAllowedAdminIp(normalizedIp)) {
      this.logger.warn(
        `Blocked admin authentication for ${user.email} from IP ${normalizedIp || 'unknown'}`,
      );
      throw new UnauthorizedException('Admin access denied from this IP');
    }
  }

  private logAdminAccess(
    event: 'login' | 'refresh',
    user: AuthUserLike,
    meta?: { ua?: string; ip?: string },
  ) {
    if (user.role !== UserRole.admin && user.role !== UserRole.superadmin) {
      return;
    }

    this.logger.log(
      JSON.stringify({
        type: 'admin_auth',
        event,
        email: user.email,
        role: user.role,
        ip: normalizeIp(meta?.ip),
        userAgent: meta?.ua ?? '',
        at: new Date().toISOString(),
      }),
    );
  }

  async validateUser(email: string, mot_passe: string): Promise<AuthUserLike> {
    const doc = await this.users
      .findOne({ email })
      .select('+mot_passe +twoFactorSecret +twoFactorTempSecret')
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
      twoFactorEnabled: (raw as AuthUserLike & { twoFactorEnabled?: boolean })
        .twoFactorEnabled,
    };
  }

  async login(
    email: string,
    mot_passe: string,
    meta?: { ua?: string; ip?: string },
  ) {
    const user = await this.validateUser(email, mot_passe);
    this.ensureAdminIpAllowed(user, meta?.ip);
    const tokenUser: AuthUserLike = {
      _id: user._id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      isActive: user.isActive,
      twoFactorEnabled: user.twoFactorEnabled,
    };

    const at = this.signToken(tokenUser);
    const rt = await this.rts.generate(at.user.sub, 'user', meta);
    this.logAdminAccess('login', tokenUser, meta);
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
    this.ensureAdminIpAllowed(
      {
        _id: userDoc._id,
        email: userDoc.email,
        role: userDoc.role,
        nom: userDoc.nom,
        isActive: userDoc.isActive,
      },
      meta?.ip,
    );
    const refreshedUser: AuthUserLike = {
      _id: userDoc._id,
      email: userDoc.email,
      role: userDoc.role,
      nom: userDoc.nom,
      isActive: userDoc.isActive,
    };
    const at = this.signToken(refreshedUser);
    this.logAdminAccess('refresh', refreshedUser, meta);
    return {
      ...at,
      refresh_token: newToken,
      refresh_expires_at: expiresAt,
      cookie,
    };
  }

  async findUserForTwoFactor(userId: string) {
    const user = await this.users
      .findById(userId)
      .select('+twoFactorSecret +twoFactorTempSecret')
      .lean<AuthUserLike & { twoFactorEnabled?: boolean } | null>();
    if (!user || !user.email || !user.role) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }
    return user;
  }

  async completeTwoFactorLogin(
    userId: string,
    meta?: { ua?: string; ip?: string },
  ) {
    const user = await this.findUserForTwoFactor(userId);
    this.ensureAdminIpAllowed(user, meta?.ip);
    const tokenUser: AuthUserLike = {
      _id: user._id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      isActive: user.isActive,
      twoFactorEnabled: user.twoFactorEnabled,
    };

    const at = this.signToken(tokenUser);
    const rt = await this.rts.generate(at.user.sub, 'user', meta);
    this.logAdminAccess('login', tokenUser, meta);
    await this.auditLogs.record({
      userId: at.user.sub,
      email: user.email,
      event: 'admin_login_completed',
      status: 'success',
      role: String(user.role),
      ip: meta?.ip,
      userAgent: meta?.ua,
      metadata: { via: 'password+totp' },
    });
    return { ...at, refresh_token: rt.token, refresh_expires_at: rt.expiresAt };
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
      this.configService.get<string>('auth.passwordResetSecret');
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
      this.configService.get<string>('auth.passwordResetSecret');
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
