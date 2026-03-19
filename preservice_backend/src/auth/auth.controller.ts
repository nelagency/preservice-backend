import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { TokenBlacklistService } from './token-blacklist.service';
import { RefreshTokensService } from './refresh-tokens.service';
import { ConfigService } from '@nestjs/config';
import { UserRole } from 'src/users/entities/user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { TwoFactorService } from './two-factor.service';
import { AdminAuditLogService } from './admin-audit-log.service';

class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  mot_passe: string;
}

class RegisterDto {
  @ApiProperty()
  @IsString()
  nom: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  numero_tel?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(6)
  mot_passe?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(6)
  mot_de_passe?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  telephone?: string;
}

class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  new_password: string;
}

class TwoFactorCodeDto {
  @ApiProperty()
  @IsString()
  code: string;
}

class VerifyTwoFactorLoginDto extends TwoFactorCodeDto {
  @ApiProperty()
  @IsString()
  twoFactorToken: string;
}

type AuthReqUser = {
  sub?: string;
  exp?: number;
  role?: 'user' | 'admin' | 'superadmin' | 'serveur';
  realm?: 'user' | 'serveur';
};
type AuthRequest = Request & { user?: AuthReqUser };

function getBearer(req: Request): string | null {
  const h = req.headers.authorization || '';
  const [type, token] = h.split(' ');
  return type?.toLowerCase() === 'bearer' && token ? token : null;
}

function getRefreshFromReq(req: Request): string | null {
  // cookie "rt" OU header Authorization: Refresh <token>
  const rtCookie = req.cookies as { rt?: string } | undefined;
  const rt = rtCookie?.rt;
  if (rt) return rt;
  const body = req.body as
    | { refresh_token?: string; refreshToken?: string }
    | undefined;
  const bodyToken = body?.refresh_token ?? body?.refreshToken;
  if (typeof bodyToken === 'string' && bodyToken.trim())
    return bodyToken.trim();
  const h = req.headers.authorization || '';
  const [type, token] = h.split(' ');
  return type?.toLowerCase() === 'refresh' && token ? token : null;
}

function normalizeRole(input?: string): UserRole | undefined {
  if (!input) return undefined;
  const role = input.trim().toLowerCase();
  if (role === 'client' || role === 'utilisateur' || role === 'user')
    return UserRole.user;
  if (role === 'admin') return UserRole.admin;
  if (role === 'superadmin' || role === 'super-admin')
    return UserRole.superadmin;
  return undefined;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly auth: AuthService,
    private readonly blacklist: TokenBlacklistService,
    private readonly rts: RefreshTokensService,
    private readonly twoFactor: TwoFactorService,
    private readonly adminAuditLogs: AdminAuditLogService,
  ) {}

  // Petit helper pour poser correctement le cookie (cf. plus bas implémentation finale)
  private setRefreshCookie(res: Response, token: string, expiresAt: Date) {
    const secure =
      String(this.configService.get('cookies.cookieSecure')).toLowerCase() ===
      'true';
    const domain =
      this.configService.get<string>('cookies.cookieDomain') || undefined;
    res.cookie('rt', token, {
      httpOnly: true,
      secure,
      sameSite: secure ? 'none' : 'lax',
      domain,
      path: '/api/auth',
      expires: expiresAt,
    });
  }

  private clearRefreshCookie(res: Response) {
    const secure =
      String(this.configService.get('cookies.cookieSecure')).toLowerCase() ===
      'true';
    const domain =
      this.configService.get<string>('cookies.cookieDomain') || undefined;
    res.clearCookie('rt', {
      httpOnly: true,
      secure,
      sameSite: secure ? 'none' : 'lax',
      domain,
      path: '/api/auth',
    });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Connexion d'un utilisateur",
    description: 'Authentifie l’utilisateur et retourne un jeton JWT.',
    operationId: 'authLogin',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      default: {
        value: { email: 'ali.bensalem@example.com', mot_passe: 'Passw0rd!' },
      },
    },
  })
  @ApiOkResponse({ description: 'Authentification réussie (JWT retourné).' })
  @ApiUnauthorizedResponse({
    description: 'Identifiants invalides ou compte inactif.',
  })
  async login(
    @Body() dto: LoginDto,
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const meta = { ua: req.headers['user-agent'], ip: req.ip };
    let userForLogin;
    try {
      userForLogin = await this.auth.validateUser(dto.email, dto.mot_passe);
    } catch (error) {
      await this.adminAuditLogs.record({
        email: dto.email,
        event: 'admin_login_attempt',
        status: 'failure',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: { reason: 'invalid_credentials' },
      });
      throw error;
    }

    if (this.twoFactor.requiresTwoFactor(userForLogin)) {
      return this.twoFactor.createLoginChallenge(
        {
          _id: userForLogin._id,
          email: userForLogin.email,
          role: userForLogin.role,
        },
        meta,
      );
    }

    const result = await this.auth.login(dto.email, dto.mot_passe, meta);
    const frontendBase = (
      this.configService.get<string>('FRONTEND_BASE_URL') ||
      'https://dashboard.nelagency.com'
    ).replace(/\/$/, '');

    this.setRefreshCookie(res, result.refresh_token, result.refresh_expires_at);

    return { ...result, redirectTo: `${frontendBase}/dashboard` };
  }

  @Public()
  @Post('2fa/verify-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validation du code 2FA au login admin',
    operationId: 'authVerifyTwoFactorLogin',
  })
  async verifyTwoFactorLogin(
    @Body() dto: VerifyTwoFactorLoginDto,
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const meta = { ua: req.headers['user-agent'], ip: req.ip };
    const challenge = await this.twoFactor.verifyLoginChallenge(
      dto.twoFactorToken,
      dto.code,
      meta,
    );
    const result = await this.auth.completeTwoFactorLogin(challenge.userId, meta);
    this.setRefreshCookie(res, result.refresh_token, result.refresh_expires_at);

    return { ...result, redirectTo: `${this.configService.get<string>('FRONTEND_BASE_URL') || 'https://dashboard.nelagency.com'}/dashboard` };
  }

  @Public()
  @Post('register')
  @ApiOperation({
    summary: "Inscription d'un utilisateur",
    description: 'Crée un nouvel utilisateur et renvoie un JWT.',
    operationId: 'authRegister',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      default: {
        value: {
          nom: 'Nadia Test',
          email: 'nadia@example.com',
          numero_tel: '+21620000099',
          mot_passe: 'Passw0rd!',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Utilisateur créé et connecté (JWT retourné).',
  })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const meta = { ua: req.headers['user-agent'], ip: req.ip };
    const mot_passe = dto.mot_passe ?? dto.mot_de_passe;
    const numero_tel = dto.numero_tel ?? dto.telephone;
    const role = normalizeRole(dto.role);

    if (!mot_passe || mot_passe.length < 6) {
      throw new BadRequestException(
        'mot_passe must be a string with minimum length of 6',
      );
    }
    if (!numero_tel || typeof numero_tel !== 'string') {
      throw new BadRequestException('numero_tel must be a string');
    }
    if (role && role !== UserRole.user) {
      throw new BadRequestException(
        'Public register cannot set admin or superadmin role',
      );
    }

    const payload = {
      nom: dto.nom,
      email: dto.email,
      numero_tel,
      adresse: dto.adresse,
      mot_passe,
      role: UserRole.user,
    };

    const result = await this.auth.register(payload, meta);
    const frontendBase = (
      this.configService.get<string>('FRONTEND_BASE_URL') ||
      'https://dashboard.nelagency.com'
    ).replace(/\/$/, '');
    this.setRefreshCookie(res, result.refresh_token, result.refresh_expires_at);
    return { ...result, redirectTo: `${frontendBase}/dashboard` };
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({
    summary: 'Profil de l’utilisateur connecté',
    description: 'Retourne le payload du JWT (sub, email, role, etc.).',
    operationId: 'authMe',
  })
  @ApiOkResponse({ description: 'Profil récupéré.' })
  me(@Req() req: AuthRequest) {
    return req.user;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renouvellement du token',
    operationId: 'authRefresh',
  })
  async refresh(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const old = getRefreshFromReq(req);
    if (!old) throw new UnauthorizedException('Refresh token manquant');

    const meta = { ua: req.headers['user-agent'], ip: req.ip };
    const { access_token, user, refresh_token, refresh_expires_at } =
      await this.auth.refresh(old, req.user?.sub, meta);

    // pose le nouveau cookie et efface l’ancien (rotation)
    this.setRefreshCookie(res, refresh_token, refresh_expires_at);
    return { user, access_token, refresh_token, refresh_expires_at };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Demande de reinitialisation mot de passe',
    operationId: 'authForgotPassword',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.requestPasswordReset(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reinitialisation mot de passe par token',
    operationId: 'authResetPassword',
  })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.token, dto.new_password);
  }

  @Get('2fa/status')
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Statut de la double authentification admin',
    operationId: 'authTwoFactorStatus',
  })
  async twoFactorStatus(@Req() req: AuthRequest) {
    if (!req.user?.sub) throw new UnauthorizedException('Utilisateur introuvable');
    return this.twoFactor.getStatus(req.user.sub);
  }

  @Post('2fa/setup')
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Initialise la configuration de la double authentification admin',
    operationId: 'authTwoFactorSetup',
  })
  async twoFactorSetup(@Req() req: AuthRequest) {
    if (!req.user?.sub) throw new UnauthorizedException('Utilisateur introuvable');
    return this.twoFactor.beginSetup(req.user.sub, {
      ua: req.headers['user-agent'],
      ip: req.ip,
    });
  }

  @Post('2fa/enable')
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Active la double authentification admin',
    operationId: 'authTwoFactorEnable',
  })
  async twoFactorEnable(
    @Req() req: AuthRequest,
    @Body() dto: TwoFactorCodeDto,
  ) {
    if (!req.user?.sub) throw new UnauthorizedException('Utilisateur introuvable');
    return this.twoFactor.enable(req.user.sub, dto.code, {
      ua: req.headers['user-agent'],
      ip: req.ip,
    });
  }

  @Post('2fa/disable')
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Désactive la double authentification admin',
    operationId: 'authTwoFactorDisable',
  })
  async twoFactorDisable(
    @Req() req: AuthRequest,
    @Body() dto: TwoFactorCodeDto,
  ) {
    if (!req.user?.sub) throw new UnauthorizedException('Utilisateur introuvable');
    return this.twoFactor.disable(req.user.sub, dto.code, {
      ua: req.headers['user-agent'],
      ip: req.ip,
    });
  }

  @Get('admin-audit-logs')
  @Roles('admin', 'superadmin')
  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({
    summary: 'Retourne les derniers logs d audit admin',
    operationId: 'authAdminAuditLogs',
  })
  async getAdminAuditLogs(@Req() req: AuthRequest) {
    if (!req.user?.sub) throw new UnauthorizedException('Utilisateur introuvable');
    const raw = (req as Request & { query?: { limit?: string } }).query?.limit;
    const limit = raw ? Number(raw) : 50;
    return this.adminAuditLogs.list(limit);
  }

  @Public()
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Déconnexion', operationId: 'authLogout' })
  async logout(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = getBearer(req);
    const exp = req.user?.exp;

    const sub = req.user?.sub;

    // Blacklist l'access token (comme déjà fait avant)
    if (token && exp) {
      await this.blacklist.add(token, sub ?? null, exp);
    }

    // Révoque le refresh courant (si dispo) et efface le cookie
    const rt = getRefreshFromReq(req);
    if (rt) await this.rts.revoke(rt);
    this.clearRefreshCookie(res);

    if (req.user?.role === 'admin' || req.user?.role === 'superadmin') {
      this.logger.log(
        JSON.stringify({
          type: 'admin_auth',
          event: 'logout',
          userId: req.user.sub,
          role: req.user.role,
          ip: req.ip,
          at: new Date().toISOString(),
        }),
      );
    }

    return { success: true };
  }

  @ApiBearerAuth()
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Déconnexion de tous les appareils',
    operationId: 'authLogoutAll',
  })
  async logoutAll(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sub = req.user?.sub;
    if (sub) await this.rts.revokeAllForUser(sub);
    this.clearRefreshCookie(res);

    if (req.user?.role === 'admin' || req.user?.role === 'superadmin') {
      this.logger.log(
        JSON.stringify({
          type: 'admin_auth',
          event: 'logout_all',
          userId: req.user.sub,
          role: req.user.role,
          ip: req.ip,
          at: new Date().toISOString(),
        }),
      );
    }

    return { success: true };
  }
}
