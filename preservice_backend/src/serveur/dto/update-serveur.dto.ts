import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateServeurDto } from './create-serveur.dto';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateServeurDto extends PartialType(CreateServeurDto) {
    @ApiPropertyOptional() @IsOptional() @IsEmail()
    email?: string;

    @ApiPropertyOptional({ minLength: 6 })
    @IsOptional() @IsString() @MinLength(6)
    mot_passe?: string;
}