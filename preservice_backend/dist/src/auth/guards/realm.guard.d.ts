import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class RealmGuard implements CanActivate {
    private expected;
    constructor(expected: 'user' | 'serveur');
    canActivate(ctx: ExecutionContext): boolean;
}
