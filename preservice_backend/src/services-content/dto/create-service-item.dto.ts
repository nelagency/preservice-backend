import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateServiceItemDto {
  @ApiProperty({ example: 'Corporate' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title: string;

  @ApiProperty({ example: 'Service traiteur et staffing pour événements d’entreprise.' })
  @IsString()
  @MinLength(5)
  @MaxLength(3000)
  description: string;

  @ApiProperty({ example: 'corporate' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  @MaxLength(120)
  slug: string;

  @ApiPropertyOptional({ example: '/media/services/corporate.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

