import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ServeurAuthService } from './serveur-auth.service';
// (optionnel mais propre) un guard qui garantit realm=serveur
// import { UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { AccountTypeGuard } from '../auth/guards/account-type.guard';
import { Public } from 'src/common/decorators/public.decorator';

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

class ServeurLoginResp {
    access_token: string;
    refresh_token: string;
    refresh_expires_at: Date | string;
    user: ServeurAuthUser;
}

@ApiTags('Auth Serveur')
@Controller('auth-serveur')
export class ServeurAuthController {
    constructor(private readonly auth: ServeurAuthService) { }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Connexion serveur',
        description: 'Authentifie un compte serveur par email/mot de passe et renvoie les jetons.',
        operationId: 'authServeurLogin',
    })
    @ApiBody({
        type: ServeurLoginDto,
        examples: {
            default: { value: { email: 'ali.bensalem@example.com', mot_passe: 'Passw0rd!' } },
        },
    })
    @ApiOkResponse({
        description: 'Authentification serveur réussie.',
        type: ServeurLoginResp,
        schema: {
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refresh_expires_at: '2025-11-12T07:34:02.000Z',
                user: {
                    sub: '66f…abc',
                    email: 'ali.bensalem@example.com',
                    role: 'serveur',
                    nom: 'Ali Bensalem',
                    isActive: true,
                    realm: 'serveur',
                },
            },
        },
    })
    @ApiUnauthorizedResponse({ description: 'Identifiants invalides ou compte inactif.' })
    @ApiResponse({ status: 500, description: 'Erreur serveur.' })
    async login(@Body() dto: ServeurLoginDto, @Req() req: any, @Res({ passthrough: true }) res: Response) {
        const meta = { ua: req.headers['user-agent'], ip: req.ip };
        const result = await this.auth.login(dto.email, dto.mot_passe, meta);
        // si tu veux poser un cookie httpOnly 'rt' :
        // this.setRefreshCookie(res, result.refresh_token, result.refresh_expires_at);
        return result;
    }

    @Get('me')
    @ApiOperation({
        summary: 'Profil du serveur connecté',
        description: 'Retourne le payload du JWT (realm=serveur).',
        operationId: 'authServeurMe',
    })
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'Profil serveur (décodé du JWT).',
        type: ServeurAuthUser,
        schema: {
            example: {
                sub: '66f…abc',
                email: 'ali.bensalem@example.com',
                role: 'serveur',
                nom: 'Ali Bensalem',
                isActive: true,
                realm: 'serveur',
            },
        },
    })
    @ApiUnauthorizedResponse({ description: 'Token manquant/expiré ou realm non autorisé.' })
    // @UseGuards(JwtAuthGuard, new AccountTypeGuard('serveur')) // <-- recommandé à la place du if
    async me(@Req() req: any) {
        // Si tu n’utilises pas encore le guard de realm, garde ce check minimal :
        if (req.user?.realm !== 'serveur') {
            // tu peux renvoyer une UnauthorizedException pour une doc plus propre :
            // throw new UnauthorizedException('Wrong realm');
            return { error: 'Wrong realm' };
        }
        return req.user;
    }

    // (Optionnel) endpoint refresh dédié aux serveurs si tu sépares les flux
    // @Public()
    // @Post('refresh')
    // @HttpCode(HttpStatus.OK)
    // @ApiOperation({ summary: 'Renouvellement du token (serveur)', operationId: 'authServeurRefresh' })
    // @ApiOkResponse({ description: 'Nouveaux jetons émis.', type: ServeurLoginResp })
    // async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    //   const old = getRefreshFromReq(req); // même helper que côté AuthController
    //   const meta = { ua: req.headers['user-agent'], ip: req.ip };
    //   const { access_token, user, refresh_token, refresh_expires_at } = await this.auth.refresh(old, req?.user?.sub, meta);
    //   this.setRefreshCookie(res, refresh_token, refresh_expires_at);
    //   return { user, access_token, refresh_token, refresh_expires_at };
    // }
}
