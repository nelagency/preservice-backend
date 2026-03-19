import { Module } from '@nestjs/common';
import { AvisService } from './avis.service';
import { AvisController } from './avis.controller';
import { Avi, AvisSchema } from './entities/avi.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Avi.name, schema: AvisSchema }]),
  ],
  controllers: [AvisController],
  providers: [AvisService],
})
export class AvisModule {}
