import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, MinLength, IsInt, Min, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { ServeurStatus } from '../entities/serveur.entity';

export class CreateServeurDto {
    @ApiProperty() @IsString() @MinLength(2) nom: string;
    @ApiProperty() @IsString() @MinLength(2) prenom: string;
    @ApiProperty() @IsString() @MinLength(5) phone: string;

    @ApiProperty() @IsEmail() email: string;
    @ApiProperty({ minLength: 6 }) @IsString() @MinLength(6) mot_passe: string;

    @ApiPropertyOptional({ minimum: 0 })
    @IsOptional() @Type(() => Number) @IsInt() @Min(0)
    years?: number;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional() @IsArray() @IsString({ each: true })
    skills?: string[];

    @ApiPropertyOptional({ enum: ServeurStatus })
    @IsOptional() @IsEnum(ServeurStatus)
    status?: ServeurStatus;

    @ApiPropertyOptional()
    @IsOptional() @Type(() => Boolean) @IsBoolean()
    isActive?: boolean;
}