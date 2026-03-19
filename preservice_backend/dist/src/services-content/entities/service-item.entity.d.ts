import { Document } from 'mongoose';
export type ServiceItemDocument = ServiceItem & Document & {
    createdAt: Date;
    updatedAt: Date;
};
export declare class ServiceItem {
    title: string;
    description: string;
    slug: string;
    imageUrl?: string;
    isActive: boolean;
}
export declare const ServiceItemSchema: import("mongoose").Schema<ServiceItem, import("mongoose").Model<ServiceItem, any, any, any, Document<unknown, any, ServiceItem, any, {}> & ServiceItem & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ServiceItem, Document<unknown, {}, import("mongoose").FlatRecord<ServiceItem>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ServiceItem> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
