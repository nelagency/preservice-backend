import { Document } from 'mongoose';
export type AboutContentDocument = AboutContent & Document & {
    createdAt: Date;
    updatedAt: Date;
};
declare class AboutSection {
    title: string;
    content: string;
}
export declare class AboutContent {
    key: string;
    vision?: string;
    histoire?: string;
    valeurs: string[];
    founderImages: string[];
    sections: AboutSection[];
}
export declare const AboutContentSchema: import("mongoose").Schema<AboutContent, import("mongoose").Model<AboutContent, any, any, any, Document<unknown, any, AboutContent, any, {}> & AboutContent & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AboutContent, Document<unknown, {}, import("mongoose").FlatRecord<AboutContent>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AboutContent> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export {};
