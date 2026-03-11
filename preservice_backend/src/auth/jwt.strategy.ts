import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { TokenBlacklistService } from './token-blacklist.service';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

type JwtPayload = {
  sub: string;
  email?: string;
  role?: string;
  realm?: 'user' | 'serveur';
  typ?: string;
};

function bearerFromRequest(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const [type, token] = auth.split(' ');
  if (!type || !token) return null;
  return type.toLowerCase() === 'bearer' ? token : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly blacklist: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: (req: Request): string | null => bearerFromRequest(req),
      secretOrKey: configService.get<string>('auth.accessToken') ?? '',
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    if (!req) throw new UnauthorizedException('Requete introuvable');

    const token = bearerFromRequest(req);
    if (!token) throw new UnauthorizedException('Token manquant');

    const isRevoked = await this.blacklist.has(token);
    if (isRevoked) throw new UnauthorizedException('Token revoque');

    return payload;
  }
}
