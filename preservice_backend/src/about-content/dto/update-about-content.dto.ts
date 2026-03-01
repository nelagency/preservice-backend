import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

class AboutSectionDto {
  @ApiPropertyOptional({ example: 'Les débuts' })
  @IsString()
  @MaxLength(160)
  title: string;

  @ApiPropertyOptional({ example: 'Nel Agency a commencé avec des événements privés...' })
  @IsString()
  @MaxLength(6000)
  content: string;
}

export class UpdateAboutContentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(6000)
  vision?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(12000)
  histoire?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  valeurs?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  founderImages?: string[];

  @ApiPropertyOptional({ type: [AboutSectionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AboutSectionDto)
  sections?: AboutSectionDto[];
}

