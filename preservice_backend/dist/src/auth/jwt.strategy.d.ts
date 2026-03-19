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
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly blacklist;
    constructor(configService: ConfigService, blacklist: TokenBlacklistService);
    validate(req: Request, payload: JwtPayload): Promise<JwtPayload>;
}
export {};
