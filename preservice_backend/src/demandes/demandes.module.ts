import { Module } from '@nestjs/common';
import { DemandesService } from './demandes.service';
import { DemandesController } from './demandes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Demande, DemandeSchema } from './entities/demande.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Demande.name, schema: DemandeSchema }]),
  ],
  controllers: [DemandesController],
  providers: [DemandesService],
})
export class DemandesModule {}
