import { AssignmentStatus, CandidatureStatus } from '../entities/participation.entity';
import { EventRoleEnum } from 'src/events/entities/event.entity';
export declare class ApplyDto {
    serveurId: string;
    notes?: string;
}
export declare class ApproveDto {
    status: CandidatureStatus;
}
export declare class AssignDto {
    role: EventRoleEnum;
    assignmentStatus?: AssignmentStatus;
}
export declare class BulkAssignItem {
    serveurId: string;
    role: EventRoleEnum;
    assignmentStatus?: AssignmentStatus;
}
export declare class BulkAssignDto {
    assignments: BulkAssignItem[];
}
export declare class CreateParticipationDto {
}
