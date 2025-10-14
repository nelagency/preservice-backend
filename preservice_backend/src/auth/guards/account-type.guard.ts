// auth/guards/account-type.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AccountTypeGuard implements CanActivate {
    constructor(private readonly expected: 'user' | 'serveur') { }
    canActivate(ctx: ExecutionContext): boolean {
        const req = ctx.switchToHttp().getRequest();
        const realm = req.user?.realm || req.user?.role; // selon ton payload access_token
        return realm === this.expected;
    }
}
// usage:
// @UseGuards(JwtAuthGuard, new AccountTypeGuard('serveur'))
