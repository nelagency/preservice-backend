import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ServeurAuthService } from './serveur-auth.service';
import { ConfigService } from '@nestjs/config';
import { Public } from 'src/common/decorators/public.decorator';
import { getClientIp } from 'src/common/security.utils';
import { AuthRateLimitService } from './auth-rate-limit.service';

class ServeurLoginDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) mot_passe: string;
}

class ServeurAuthUser {
  sub: string;
  email: string;
  role: 'serveur';
  nom?: string;
  isActive?: boolean;
  realm: 'serveur';
}

type AuthRequest = Request & { user?: ServeurAuthUser };

class ServeurLoginResp {
  access_token: string;
  refresh_token: string;
  refresh_expires_at: Date | string;
  user: ServeurAuthUser;
}

function getRefreshFromReq(req: Request): string | null {
  const rtCookie = req.cookies as { rt?: string } | undefined;
  const rt = rtCookie?.rt;
  if (rt) return rt;

  const body = req.body as
    | { refresh_token?: string; refreshToken?: string }
    | undefined;
  const bodyToken = body?.refresh_token ?? body?.refreshToken;
  if (typeof bodyToken === 'string' && bodyToken.trim()) {
    return bodyToken.trim();
  }

  const h = req.headers.authorization || '';
  const [type, token] = h.split(' ');
  return type?.toLowerCase() === 'refresh' && token ? token : null;
}

@ApiTags('Auth Serveur')
@Controller('auth-serveur')
export class ServeurAuthController {
  constructor(
    private readonly auth: ServeurAuthService,
    private readonly configService: ConfigService,
    private readonly authRateLimit: AuthRateLimitService,
  ) {}

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
      path: '/api',
      expires: expiresAt,
    });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion serveur',
    description:
      'Authentifie un compte serveur par email/mot de passe et renvoie les jetons.',
    operationId: 'authServeurLogin',
  })
  @ApiBody({
    type: ServeurLoginDto,
    examples: {
      default: {
        value: { email: 'ali.bensalem@example.com', mot_passe: 'Passw0rd!' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Authentification serveur reussie.',
    type: ServeurLoginResp,
  })
  @ApiUnauthorizedResponse({
    description: 'Identifiants invalides ou compte inactif.',
  })
  @ApiResponse({ status: 500, description: 'Erreur serveur.' })
  async login(
    @Body() dto: ServeurLoginDto,
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = getClientIp(req);
    const rateKey = `serveur-login:${ip}:${dto.email.toLowerCase().trim()}`;
    this.authRateLimit.consume(rateKey, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
      message: 'Trop de tentatives de connexion, reessayez plus tard.',
    });

    const meta = { ua: req.headers['user-agent'], ip };
    const result = await this.auth.login(dto.email, dto.mot_passe, meta);
    this.setRefreshCookie(res, result.refresh_token, result.refresh_expires_at);
    this.authRateLimit.reset(rateKey);

    const frontendBase = (
      this.configService.get<string>('FRONTEND_BASE_URL') ||
      'https://dashboard.nelagency.com'
    ).replace(/\/$/, '');

    return { ...result, redirectTo: `${frontendBase}/serveur` };
  }

  @Get('me')
  @ApiOperation({
    summary: 'Profil du serveur connecte',
    description: 'Retourne le payload du JWT (realm=serveur).',
    operationId: 'authServeurMe',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Profil serveur decode du JWT.',
    type: ServeurAuthUser,
  })
  @ApiUnauthorizedResponse({
    description: 'Token manquant/expire ou realm non autorise.',
  })
  me(@Req() req: AuthRequest) {
    if (req.user?.realm !== 'serveur') {
      throw new UnauthorizedException('Wrong realm');
    }
    return req.user;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renouvellement du token serveur',
    operationId: 'authServeurRefresh',
  })
  @ApiOkResponse({ description: 'Nouveaux jetons emis.', type: ServeurLoginResp })
  async refresh(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const old = getRefreshFromReq(req);
    if (!old) throw new UnauthorizedException('Refresh token manquant');

    const ip = getClientIp(req);
    this.authRateLimit.consume(`serveur-refresh:${ip}`, {
      limit: 20,
      windowMs: 15 * 60 * 1000,
      message: 'Trop de renouvellements de session, reessayez plus tard.',
    });

    const meta = { ua: req.headers['user-agent'], ip };
    const result = await this.auth.refresh(old, req.user?.sub, meta);
    this.setRefreshCookie(res, result.refresh_token, result.refresh_expires_at);
    return result;
  }
}
