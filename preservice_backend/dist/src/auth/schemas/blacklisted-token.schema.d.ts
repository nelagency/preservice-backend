import { Document, Types } from 'mongoose';
export type BlacklistedTokenDocument = BlacklistedToken & Document;
export declare class BlacklistedToken {
    tokenHash: string;
    userId?: Types.ObjectId;
    expiresAt: Date;
}
export declare const BlacklistedTokenSchema: import("mongoose").Schema<BlacklistedToken, import("mongoose").Model<BlacklistedToken, any, any, any, Document<unknown, any, BlacklistedToken, any, {}> & BlacklistedToken & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, BlacklistedToken, Document<unknown, {}, import("mongoose").FlatRecord<BlacklistedToken>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<BlacklistedToken> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
