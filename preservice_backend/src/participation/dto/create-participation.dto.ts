import { ArrayMinSize, IsArray, IsDateString, IsEmail, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AssignmentStatus, CandidatureStatus } from '../entities/participation.entity';
import { EventRoleEnum } from 'src/events/entities/event.entity';

export class ApplyDto {
    @IsMongoId() serveurId!: string;
    @IsOptional() @IsString() notes?: string;
}

export class ApproveDto {
    @IsEnum(CandidatureStatus) status!: CandidatureStatus; // approved | rejected
}

export class AssignDto {
    @IsEnum(EventRoleEnum) role!: EventRoleEnum;
    @IsOptional() @IsEnum(AssignmentStatus) assignmentStatus?: AssignmentStatus; // provisional | confirmed
}

export class BulkAssignItem {
    @IsMongoId() serveurId!: string;
    @IsEnum(EventRoleEnum) role!: EventRoleEnum;
    @IsOptional() @IsEnum(AssignmentStatus) assignmentStatus?: AssignmentStatus;
}

export class BulkAssignDto {
    @IsArray() @ArrayMinSize(0)
    @ValidateNested({ each: true })
    @Type(() => BulkAssignItem)
    assignments!: BulkAssignItem[];
}

export class CreateParticipationDto { }