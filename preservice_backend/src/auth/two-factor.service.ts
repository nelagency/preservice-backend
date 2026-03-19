import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { generateSecret, verify, generateURI } from 'otplib';
import QRCode from 'qrcode';
import { User, UserDocument, UserRole } from 'src/users/entities/user.entity';
import { AdminAuditLogService } from './admin-audit-log.service';
import { normalizeIp } from 'src/common/security.utils';
import type { StringValue } from 'ms';

type TwoFactorChallengePayload = {
  sub: string;
  email: string;
  role: UserRole.admin | UserRole.superadmin;
  typ: '2fa_login';
  realm: 'user';
};

type AdminUser = {
  _id: unknown;
  email: string;
  role: UserRole;
  nom?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  twoFactorTempSecret?: string;
};

function toStringValue(
  value: string | number | undefined,
): number | StringValue | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim()) return value as StringValue;
  return undefined;
}

@Injectable()
export class TwoFactorService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwt: JwtService,
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
    private readonly auditLogs: AdminAuditLogService,
  ) {
  }

  private getEncryptionKey() {
    const raw =
      this.configService.get<string>('TWO_FACTOR_ENCRYPTION_KEY') ||
      this.configService.get<string>('auth.refreshToken') ||
      this.configService.get<string>('auth.accessToken');

    if (!raw) {
      throw new UnauthorizedException('2FA encryption key is not configured');
    }

    return createHash('sha256').update(raw).digest();
  }

  private encryptSecret(secret: string) {
    const iv = randomBytes(12);
    const key = this.getEncryptionKey();
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(secret, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
  }

  private decryptSecret(secret?: string) {
    if (!secret) return '';
    const [ivRaw, authTagRaw, encryptedRaw] = secret.split(':');
    if (!ivRaw || !authTagRaw || !encryptedRaw) {
      throw new UnauthorizedException('Invalid 2FA secret payload');
    }

    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.getEncryptionKey(),
      Buffer.from(ivRaw, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(authTagRaw, 'base64'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedRaw, 'base64')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }

  private assertAdminRole(role?: UserRole) {
    if (role !== UserRole.admin && role !== UserRole.superadmin) {
      throw new UnauthorizedException('2FA is reserved for admin accounts');
    }
  }

  private sanitizeCode(code: string) {
    return code.replace(/\s+/g, '').trim();
  }

  private async findAdminUserById(userId: string) {
    const user = await this.users
      .findById(userId)
      .select('+twoFactorSecret +twoFactorTempSecret')
      .lean<AdminUser | null>();
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');
    this.assertAdminRole(user.role);
    return user;
  }

  async getStatus(userId: string) {
    const user = await this.findAdminUserById(userId);
    return {
      enabled: !!user.twoFactorEnabled,
      pendingSetup: !!user.twoFactorTempSecret,
    };
  }

  async beginSetup(userId: string, meta?: { ip?: string; ua?: string }) {
    const user = await this.findAdminUserById(userId);
    const secret = generateSecret();
    const issuer =
      this.configService.get<string>('TWO_FACTOR_ISSUER') || 'PrestService';
    const otpauthUrl = generateURI({
      issuer,
      label: user.email,
      secret,
    });
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    await this.users.findByIdAndUpdate(userId, {
      $set: { twoFactorTempSecret: this.encryptSecret(secret) },
    });

    await this.auditLogs.record({
      userId,
      email: user.email,
      event: 'two_factor_setup_started',
      status: 'pending',
      role: user.role,
      ip: meta?.ip,
      userAgent: meta?.ua,
    });

    return {
      manualEntryKey: secret,
      otpauthUrl,
      qrCodeDataUrl,
    };
  }

  async enable(userId: string, code: string, meta?: { ip?: string; ua?: string }) {
    const user = await this.findAdminUserById(userId);
    if (!user.twoFactorTempSecret) {
      throw new BadRequestException('Aucune configuration 2FA en attente');
    }

    const secret = this.decryptSecret(user.twoFactorTempSecret);
    const isValid = await verify({
      secret,
      token: this.sanitizeCode(code),
    });
    if (!isValid) {
      await this.auditLogs.record({
        userId,
        email: user.email,
        event: 'two_factor_enable',
        status: 'failure',
        role: user.role,
        ip: meta?.ip,
        userAgent: meta?.ua,
      });
      throw new UnauthorizedException('Code 2FA invalide');
    }

    await this.users.findByIdAndUpdate(userId, {
      $set: {
        twoFactorSecret: this.encryptSecret(secret),
        twoFactorEnabled: true,
        twoFactorEnabledAt: new Date(),
      },
      $unset: { twoFactorTempSecret: 1 },
    });

    await this.auditLogs.record({
      userId,
      email: user.email,
      event: 'two_factor_enable',
      status: 'success',
      role: user.role,
      ip: meta?.ip,
      userAgent: meta?.ua,
    });

    return { success: true };
  }

  async disable(userId: string, code: string, meta?: { ip?: string; ua?: string }) {
    const user = await this.findAdminUserById(userId);
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('La 2FA n est pas active');
    }

    const secret = this.decryptSecret(user.twoFactorSecret);
    const isValid = await verify({
      secret,
      token: this.sanitizeCode(code),
    });
    if (!isValid) {
      await this.auditLogs.record({
        userId,
        email: user.email,
        event: 'two_factor_disable',
        status: 'failure',
        role: user.role,
        ip: meta?.ip,
        userAgent: meta?.ua,
      });
      throw new UnauthorizedException('Code 2FA invalide');
    }

    await this.users.findByIdAndUpdate(userId, {
      $set: { twoFactorEnabled: false },
      $unset: {
        twoFactorSecret: 1,
        twoFactorTempSecret: 1,
        twoFactorEnabledAt: 1,
      },
    });

    await this.auditLogs.record({
      userId,
      email: user.email,
      event: 'two_factor_disable',
      status: 'success',
      role: user.role,
      ip: meta?.ip,
      userAgent: meta?.ua,
    });

    return { success: true };
  }

  requiresTwoFactor(user?: {
    role?: UserRole | string;
    twoFactorEnabled?: boolean;
  }) {
    return (
      (user?.role === UserRole.admin || user?.role === UserRole.superadmin) &&
      !!user?.twoFactorEnabled
    );
  }

  async createLoginChallenge(
    user: {
      _id?: unknown;
      email: string;
      role: UserRole | string;
    },
    meta?: { ip?: string; ua?: string },
  ) {
    this.assertAdminRole(user.role as UserRole);
    const challengeExpiresIn =
      toStringValue(
        this.configService.get<string | number>('TWO_FACTOR_CHALLENGE_EXPIRES_IN'),
      ) ?? '5m';
    const payload: TwoFactorChallengePayload = {
      sub: String(user._id),
      email: user.email,
      role: user.role as UserRole.admin | UserRole.superadmin,
      typ: '2fa_login',
      realm: 'user',
    };

    const token = this.jwt.sign(payload, {
      secret: this.configService.get<string>('auth.accessToken'),
      expiresIn: challengeExpiresIn,
    });

    await this.auditLogs.record({
      userId: payload.sub,
      email: user.email,
      event: 'two_factor_login_challenge',
      status: 'pending',
      role: user.role as string,
      ip: meta?.ip,
      userAgent: meta?.ua,
    });

    return {
      requiresTwoFactor: true as const,
      twoFactorToken: token,
      message: 'Code de double authentification requis',
    };
  }

  async verifyLoginChallenge(
    challengeToken: string,
    code: string,
    meta?: { ip?: string; ua?: string },
  ) {
    let payload: TwoFactorChallengePayload;
    try {
      payload = this.jwt.verify<TwoFactorChallengePayload>(challengeToken, {
        secret: this.configService.get<string>('auth.accessToken'),
      });
    } catch {
      throw new UnauthorizedException('Challenge 2FA invalide ou expiré');
    }

    if (payload.typ !== '2fa_login') {
      throw new UnauthorizedException('Challenge 2FA invalide');
    }

    const user = await this.findAdminUserById(payload.sub);
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException('2FA non active pour ce compte');
    }

    const secret = this.decryptSecret(user.twoFactorSecret);
    const isValid = await verify({
      secret,
      token: this.sanitizeCode(code),
    });
    if (!isValid) {
      await this.auditLogs.record({
        userId: payload.sub,
        email: payload.email,
        event: 'two_factor_login_verify',
        status: 'failure',
        role: payload.role,
        ip: meta?.ip,
        userAgent: meta?.ua,
      });
      throw new UnauthorizedException('Code 2FA invalide');
    }

    await this.auditLogs.record({
      userId: payload.sub,
      email: payload.email,
      event: 'two_factor_login_verify',
      status: 'success',
      role: payload.role,
      ip: meta?.ip,
      userAgent: meta?.ua,
      metadata: { via: 'totp', ip: normalizeIp(meta?.ip) },
    });

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
