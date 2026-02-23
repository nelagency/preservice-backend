import { Document, Types } from 'mongoose';
import { EventTypeEnum } from 'src/events/entities/event.entity';
export type DemandeDocument = Demande & Document & {
    createdAt: Date;
    updatedAt: Date;
};
export declare enum DemandeStatusEnum {
    en_attente = "en_attente",
    confirme = "confirme",
    rejete = "rejete"
}
export declare class Demande {
    client: Types.ObjectId;
    type: EventTypeEnum;
    date_proposee: Date;
    nb_serveurs: number;
    status: DemandeStatusEnum;
}
export declare const DemandeSchema: import("mongoose").Schema<Demande, import("mongoose").Model<Demande, any, any, any, Document<unknown, any, Demande, any, {}> & Demande & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Demande, Document<unknown, {}, import("mongoose").FlatRecord<Demande>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Demande> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
