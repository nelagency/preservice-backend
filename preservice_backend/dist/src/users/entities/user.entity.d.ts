import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare enum UserRole {
    user = "user",
    admin = "admin",
    superadmin = "superadmin"
}
export declare class User {
    nom: string;
    email: string;
    numero_tel: string;
    adresse?: string;
    mot_passe: string;
    isActive: boolean;
    role: UserRole;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
