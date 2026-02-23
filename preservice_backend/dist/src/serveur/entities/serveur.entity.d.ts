import { Document } from 'mongoose';
export type ServeurDocument = Serveur & Document;
export declare enum ServeurStatus {
    disponible = "Disponible",
    occupe = "Occup\u00E9"
}
export declare class Serveur {
    nom: string;
    prenom: string;
    phone: string;
    email: string;
    mot_passe: string;
    years: number;
    skills: string[];
    status: ServeurStatus;
    isActive: boolean;
    get dateCreation(): Date;
}
export declare const ServeurSchema: import("mongoose").Schema<Serveur, import("mongoose").Model<Serveur, any, any, any, Document<unknown, any, Serveur, any, {}> & Serveur & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Serveur, Document<unknown, {}, import("mongoose").FlatRecord<Serveur>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Serveur> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
