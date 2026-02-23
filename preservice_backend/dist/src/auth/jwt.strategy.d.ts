import { TokenBlacklistService } from './token-blacklist.service';
import { ConfigService } from '@nestjs/config';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private blacklist;
    constructor(configService: ConfigService, blacklist: TokenBlacklistService);
    validate(req: Request, payload: any): Promise<any>;
}
export {};
