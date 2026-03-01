import { PartialType } from '@nestjs/swagger';
import { CreateInstagramPostDto } from './create-instagram-post.dto';

export class UpdateInstagramPostDto extends PartialType(CreateInstagramPostDto) {}
