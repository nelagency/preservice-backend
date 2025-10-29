import { IsDateString, IsInt, Min, IsOptional, IsString } from 'class-validator';

export class CreateTimesheetDto {
    @IsDateString() startAt!: string;
    @IsDateString() endAt!: string;
    @IsInt() @Min(0) breakMinutes!: number;
    @IsOptional() @IsString() note?: string;
}
