import { Document, Types } from 'mongoose';
import { EventRoleEnum } from 'src/events/entities/event.entity';
export type ParticipationDocument = Participation & Document;
export declare enum CandidatureStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export declare enum AssignmentStatus {
    none = "none",
    provisional = "provisional",
    confirmed = "confirmed"
}
export declare class Participation {
    event: Types.ObjectId;
    serveur: Types.ObjectId;
    candidatureStatus: CandidatureStatus;
    role?: EventRoleEnum | null;
    assignmentStatus: AssignmentStatus;
    notes?: string;
    approvedAt?: Date;
    assignedAt?: Date;
}
export declare const ParticipationSchema: import("mongoose").Schema<Participation, import("mongoose").Model<Participation, any, any, any, Document<unknown, any, Participation, any, {}> & Participation & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Participation, Document<unknown, {}, import("mongoose").FlatRecord<Participation>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Participation> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
