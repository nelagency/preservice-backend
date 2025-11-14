// src/servers/dto/change-password.dto.ts
import { IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class ChangePasswordDto {
    @Transform(({ value, obj }) => value ?? obj.current_password)
    @IsString({ message: 'currentPassword est requis (string).' })
    currentPassword: string;

    @Transform(({ value, obj }) => value ?? obj.new_password)
    @IsString({ message: 'newPassword est requis (string).' })
    @MinLength(8, { message: 'newPassword doit contenir au moins 8 caractères.' })
    newPassword: string;
}
