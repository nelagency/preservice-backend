import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';

type ReqUser = { realm?: 'user' | 'serveur'; role?: 'user' | 'serveur' };
type AuthRequest = Request & { user?: ReqUser };

@Injectable()
export class RealmGuard implements CanActivate {
  constructor(private expected: 'user' | 'serveur') {}
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<AuthRequest>();
    const realm = req.user?.realm || req.user?.role;
    return realm === this.expected;
  }
}
// usage:
// @UseGuards(JwtAuthGuard, new RealmGuard('serveur'))
