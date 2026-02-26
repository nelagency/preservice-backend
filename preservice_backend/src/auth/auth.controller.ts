import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiProperty, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { TokenBlacklistService } from './token-blacklist.service';
import { RefreshTokensService } from './refresh-tokens.service';
import { ConfigService } from '@nestjs/config';
import { UserRole } from 'src/users/entities/user.entity';

class LoginDto {
    @ApiProperty() @IsEmail()
    email: string;

    @ApiProperty() @IsString() @MinLength(6)
    mot_passe: string;
}

class RegisterDto {
    @ApiProperty() @IsString()
    nom: string;

    @ApiProperty() @IsEmail()
    email: string;

    @ApiProperty() @IsOptional() @IsString()
    numero_tel?: string;

    @ApiProperty() @IsOptional() @IsString() @MinLength(6)
    mot_passe?: string;

    @ApiProperty() @IsOptional() @IsString() @MinLength(6)
    mot_de_passe?: string;

    @ApiProperty() @IsOptional() @IsString()
    adresse?: string;

    @ApiProperty() @IsOptional() @IsString()
    role?: string;

    @ApiProperty() @IsOptional() @IsString()
    telephone?: string;
}

function getBearer(req: any): string | null {
    const h = req?.headers?.authorization || '';
    const [type, token] = h.split(' ');
    return type?.toLowerCase() === 'bearer' && token ? token : null;
}

function getRefreshFromReq(req: any): string | null {
    // cookie "rt" OU header Authorization: Refresh <token>
    const rt = req?.cookies?.rt;
    if (rt) return rt;
    const h = req?.headers?.authorization || '';
    const [type, token] = h.split(' ');
    return type?.toLowerCase() === 'refresh' && token ? token : null;
}

function normalizeRole(input?: string): UserRole | undefined {
    if (!input) return undefined;
    const role = input.trim().toLowerCase();
    if (role === 'client' || role === 'utilisateur' || role === 'user') return UserRole.user;
    if (role === 'admin') return UserRole.admin;
    if (role === 'superadmin' || role === 'super-admin') return UserRole.superadmin;
    return undefined;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly configService: ConfigService,
        private readonly auth: AuthService,
        private readonly blacklist: TokenBlacklistService,
        private readonly rts: RefreshTokensService,
    ) { }

    // Petit helper pour poser correctement le cookie (cf. plus bas implémentation finale)
    private setRefreshCookie(res: Response, token: string, expiresAt: Date) {
        const secure = String(this.configService.get('auth.cookieSecure')).toLowerCase() === 'true';
        const domain = this.configService.get('auth.cookieDomain') || undefined;
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
        const secure = String(this.configService.get('auth.cookieSecure')).toLowerCase() === 'true';
        const domain = this.configService.get('auth.cookieDomain') || undefined;
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
        description: "Authentifie l’utilisateur et retourne un jeton JWT.",
        operationId: 'authLogin',
    })
    @ApiBody({
        type: LoginDto,
        examples: {
            default: { value: { email: 'ali.bensalem@example.com', mot_passe: 'Passw0rd!' } }
        }
    })
    @ApiOkResponse({ description: 'Authentification réussie (JWT retourné).' })
    @ApiUnauthorizedResponse({ description: 'Identifiants invalides ou compte inactif.' })
    async login(@Body() dto: LoginDto, @Req() req: any, @Res({ passthrough: true }) res: Response) {
        const meta = { ua: req.headers['user-agent'], ip: req.ip };
        const result = await this.auth.login(dto.email, dto.mot_passe, meta);

        this.setRefreshCookie(res, result.refresh_token, result.refresh_expires_at);

        return { ...result, redirectTo: '/dashboard' };
    }

    @Public()
    @Post('register')
    @ApiOperation({
        summary: "Inscription d'un utilisateur",
        description: "Crée un nouvel utilisateur et renvoie un JWT.",
        operationId: 'authRegister',
    })
    @ApiBody({
        type: RegisterDto,
        examples: {
            default: { value: { nom: 'Nadia Test', email: 'nadia@example.com', numero_tel: '+21620000099', mot_passe: 'Passw0rd!' } }
        }
    })
    @ApiCreatedResponse({ description: 'Utilisateur créé et connecté (JWT retourné).' })
    async register(@Body() dto: RegisterDto, @Req() req: any, @Res({ passthrough: true }) res: Response) {
        const meta = { ua: req.headers['user-agent'], ip: req.ip };
        const mot_passe = dto.mot_passe ?? dto.mot_de_passe;
        const numero_tel = dto.numero_tel ?? dto.telephone;
        const role = normalizeRole(dto.role);

        if (!mot_passe || mot_passe.length < 6) {
            throw new BadRequestException('mot_passe must be a string with minimum length of 6');
        }
        if (!numero_tel || typeof numero_tel !== 'string') {
            throw new BadRequestException('numero_tel must be a string');
        }

        const payload = {
            nom: dto.nom,
            email: dto.email,
            numero_tel,
            adresse: dto.adresse,
            mot_passe,
            role: role ?? UserRole.user,
        };

        const result = await this.auth.register(payload as any, meta);
        this.setRefreshCookie(res, result.refresh_token, result.refresh_expires_at);
        return { ...result, redirectTo: '/dashboard' };
    }

    @ApiBearerAuth()
    @Get('me')
    @ApiOperation({
        summary: 'Profil de l’utilisateur connecté',
        description: 'Retourne le payload du JWT (sub, email, role, etc.).',
        operationId: 'authMe',
    })
    @ApiOkResponse({ description: 'Profil récupéré.' })
    me(@Req() req: any) { return req.user; }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Renouvellement du token', operationId: 'authRefresh' })
    async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
        const old = getRefreshFromReq(req);
        if (!old) return { error: 'Refresh token manquant' };

        const meta = { ua: req.headers['user-agent'], ip: req.ip };
        const { access_token, user, refresh_token, refresh_expires_at } = await this.auth.refresh(old, req?.user?.sub, meta);

        // pose le nouveau cookie et efface l’ancien (rotation)
        this.setRefreshCookie(res, refresh_token, refresh_expires_at);
        return { user, access_token, refresh_token, refresh_expires_at };
    }

    @Public()
    @ApiBearerAuth()
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Déconnexion', operationId: 'authLogout' })
    async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
        const token = getBearer(req);
        const exp = req?.user?.exp;

        const sub = req?.user?.sub;

        // Blacklist l'access token (comme déjà fait avant)
        if (token && exp) {
            await this.blacklist.add(token, sub ?? null, exp);
        }

        // Révoque le refresh courant (si dispo) et efface le cookie
        const rt = getRefreshFromReq(req);
        if (rt) await this.rts.revoke(rt);
        this.clearRefreshCookie(res);

        return { success: true };
    }

    @ApiBearerAuth()
    @Post('logout-all')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Déconnexion de tous les appareils', operationId: 'authLogoutAll' })
    async logoutAll(@Req() req: any, @Res({ passthrough: true }) res: Response) {
        const sub = req?.user?.sub;
        if (sub) await this.rts.revokeAllForUser(sub);
        this.clearRefreshCookie(res);

        return { success: true };
    }
}
