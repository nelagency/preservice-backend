import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAviDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  note: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(0)
  commentaire?: string;

  @ApiProperty()
  @IsMongoId()
  client: string;

  @ApiProperty()
  @IsMongoId()
  event: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  etat?: boolean;
}
