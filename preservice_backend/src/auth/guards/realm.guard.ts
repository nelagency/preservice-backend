import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class RealmGuard implements CanActivate {
    constructor(private expected: 'user' | 'serveur') { }
    canActivate(ctx: ExecutionContext): boolean {
        const req = ctx.switchToHttp().getRequest();
        const realm = req.user?.realm || req.user?.role;
        return realm === this.expected;
    }
}
// usage:
// @UseGuards(JwtAuthGuard, new RealmGuard('serveur'))
