import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty() @IsString() @MinLength(2) nom: string;

  @ApiProperty() @IsEmail() email: string;

  @ApiProperty() @IsString() @MinLength(5) numero_tel: string;

  @ApiPropertyOptional() @IsOptional() @IsString() adresse?: string;

  @ApiProperty() @IsString() @MinLength(6) mot_passe: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.user })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole; // défaut côté schéma = user
}
