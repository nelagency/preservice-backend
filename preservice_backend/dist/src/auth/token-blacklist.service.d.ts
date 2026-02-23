import { Model } from 'mongoose';
import { BlacklistedTokenDocument } from './schemas/blacklisted-token.schema';
export declare class TokenBlacklistService {
    private model;
    constructor(model: Model<BlacklistedTokenDocument>);
    add(token: string, userId: string | null, expSeconds: number): Promise<void>;
    has(token: string): Promise<boolean>;
}
