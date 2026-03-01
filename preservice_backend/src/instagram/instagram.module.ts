import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';
import { InstagramPost, InstagramPostSchema } from './entities/instagram-post.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: InstagramPost.name, schema: InstagramPostSchema }]),
  ],
  controllers: [InstagramController],
  providers: [InstagramService],
})
export class InstagramModule {}
