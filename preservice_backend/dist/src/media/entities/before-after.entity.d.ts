import { Document, Types } from 'mongoose';
export type BeforeAfterPairDocument = BeforeAfterPair & Document;
export declare class BeforeAfterPair {
    event: Types.ObjectId;
    before: Types.ObjectId;
    after: Types.ObjectId;
    caption?: string;
    approved: boolean;
}
export declare const BeforeAfterPairSchema: import("mongoose").Schema<BeforeAfterPair, import("mongoose").Model<BeforeAfterPair, any, any, any, Document<unknown, any, BeforeAfterPair, any, {}> & BeforeAfterPair & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, BeforeAfterPair, Document<unknown, {}, import("mongoose").FlatRecord<BeforeAfterPair>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<BeforeAfterPair> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
