import { Document, Types } from 'mongoose';
export type EventDocument = Event & Document;
export declare enum EventTypeEnum {
    Mariages = "Mariages",
    Buffets = "Buffets",
    Baptemes = "Bapt\u00EAmes",
    Anniversaires = "Anniversaires",
    Entreprise = "Entreprise"
}
export declare enum EventStatusEnum {
    confirme = "Confirm\u00E9",
    en_attente = "En attente",
    prepare = "Prepar\u00E9",
    termine = "Termin\u00E9"
}
export declare enum EventEtatEnum {
    ouvert = "Ouvert",
    complet = "Complet",
    urgent = "Urgent"
}
export declare enum EventRoleEnum {
    coordinateur = "Coordinateur",
    serveur = "Serveur",
    hotesse = "Hotesse",
    accueil = "Accueil",
    barman = "Barman",
    serviceVip = "Service VIP"
}
declare class EventPositionReq {
    role: EventRoleEnum;
    capacity: number;
}
export declare class Event {
    title: string;
    description?: string;
    location: string;
    startdate: Date;
    enddate: Date;
    type: EventTypeEnum;
    serveurs: Types.ObjectId[];
    guests: number;
    nbServeur: number;
    status: EventStatusEnum;
    etat: EventEtatEnum;
    amount: number;
    positions: EventPositionReq[];
    cover?: Types.ObjectId;
    gallery: Types.ObjectId[];
    beforeAfter: Types.ObjectId[];
}
export declare const EventSchema: import("mongoose").Schema<Event, import("mongoose").Model<Event, any, any, any, Document<unknown, any, Event, any, {}> & Event & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Event, Document<unknown, {}, import("mongoose").FlatRecord<Event>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Event> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export {};
