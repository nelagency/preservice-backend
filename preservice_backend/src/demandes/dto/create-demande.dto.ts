import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventTypeEnum } from 'src/events/entities/event.entity';
import { DemandeStatusEnum } from '../entities/demande.entity';

export class CreateDemandeDto {
  @ApiProperty() @IsMongoId() client: string;

  @ApiProperty({ enum: EventTypeEnum })
  @IsEnum(EventTypeEnum)
  type: EventTypeEnum;

  @ApiProperty() @IsDateString() date_proposee: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  nb_serveurs?: number;

  @ApiPropertyOptional({ enum: DemandeStatusEnum })
  @IsOptional()
  @IsEnum(DemandeStatusEnum)
  status?: DemandeStatusEnum;
}
