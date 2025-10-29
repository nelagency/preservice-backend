import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PayTimesheetDto {
    @IsNumber() @Min(0.01)
    amount!: number;

    @IsOptional() @IsString()
    note?: string;

    /** si true => marque le timesheet comme totalement payé */
    @IsOptional() @IsBoolean()
    finalize?: boolean;
}
