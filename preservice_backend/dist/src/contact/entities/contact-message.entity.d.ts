import { Document } from 'mongoose';
export type ContactMessageDocument = ContactMessage & Document & {
    createdAt: Date;
    updatedAt: Date;
};
export declare enum ContactMessageStatus {
    pending = "pending",
    processed = "processed"
}
export declare class ContactMessage {
    fullName: string;
    email: string;
    phone?: string;
    message: string;
    status: ContactMessageStatus;
}
export declare const ContactMessageSchema: import("mongoose").Schema<ContactMessage, import("mongoose").Model<ContactMessage, any, any, any, Document<unknown, any, ContactMessage, any, {}> & ContactMessage & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ContactMessage, Document<unknown, {}, import("mongoose").FlatRecord<ContactMessage>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ContactMessage> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
