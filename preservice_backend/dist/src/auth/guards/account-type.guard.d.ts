import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class AccountTypeGuard implements CanActivate {
    private readonly expected;
    constructor(expected: 'user' | 'serveur');
    canActivate(ctx: ExecutionContext): boolean;
}
