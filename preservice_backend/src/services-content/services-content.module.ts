import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesContentController } from './services-content.controller';
import { ServicesContentService } from './services-content.service';
import { ServiceItem, ServiceItemSchema } from './entities/service-item.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceItem.name, schema: ServiceItemSchema },
    ]),
  ],
  controllers: [ServicesContentController],
  providers: [ServicesContentService],
})
export class ServicesContentModule {}

