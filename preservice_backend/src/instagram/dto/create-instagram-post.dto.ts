import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInstagramPostDto {
  @ApiProperty({ example: 'https://images.example.com/post-1.jpg' })
  @IsUrl()
  imageUrl: string;

  @ApiPropertyOptional({ example: 'Nouveau post Instagram' })
  @IsOptional()
  @IsString()
  @MinLength(0)
  caption?: string;

  @ApiPropertyOptional({ example: 'https://www.instagram.com/p/ABC123/' })
  @IsOptional()
  @IsUrl()
  postUrl?: string;

  @ApiPropertyOptional({ example: '2026-02-26T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  postedAt?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
