import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContactMessageDto {
  @ApiProperty({ example: 'Fatou Ndiaye' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName: string;

  @ApiProperty({ example: 'fatou@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+221771234567' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiProperty({ example: 'Bonjour, je veux un devis pour 120 invités.' })
  @IsString()
  @MinLength(5)
  @MaxLength(4000)
  message: string;
}

