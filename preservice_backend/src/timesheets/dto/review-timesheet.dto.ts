import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewTimesheetDto {
    @IsIn(['approved', 'rejected']) decision!: 'approved' | 'rejected';
    @IsOptional() @IsString() comment?: string;
}