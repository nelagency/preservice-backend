import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ContactMessageStatus } from '../entities/contact-message.entity';

export class UpdateContactMessageStatusDto {
  @ApiProperty({ enum: ContactMessageStatus, example: ContactMessageStatus.processed })
  @IsEnum(ContactMessageStatus)
  status: ContactMessageStatus;
}

