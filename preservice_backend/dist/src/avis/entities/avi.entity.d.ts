import { Document, Types } from 'mongoose';
export type AvisDocument = Avi & Document;
export declare class Avi {
    note: number;
    commentaire?: string;
    client: Types.ObjectId;
    event: Types.ObjectId;
    etat: boolean;
}
export declare const AvisSchema: import("mongoose").Schema<Avi, import("mongoose").Model<Avi, any, any, any, Document<unknown, any, Avi, any, {}> & Avi & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Avi, Document<unknown, {}, import("mongoose").FlatRecord<Avi>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Avi> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
