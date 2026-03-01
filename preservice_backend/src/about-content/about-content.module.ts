import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AboutContentController } from './about-content.controller';
import { AboutContentService } from './about-content.service';
import { AboutContent, AboutContentSchema } from './entities/about-content.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AboutContent.name, schema: AboutContentSchema },
    ]),
  ],
  controllers: [AboutContentController],
  providers: [AboutContentService],
})
export class AboutContentModule {}

