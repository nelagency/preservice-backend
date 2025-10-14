import { Module } from '@nestjs/common';
import { ServeurService } from './serveur.service';
import { ServeurController } from './serveur.controller';
import { Serveur, ServeurSchema } from './entities/serveur.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: Serveur.name, schema: ServeurSchema }])],
  controllers: [ServeurController],
  providers: [ServeurService],
  exports: [
    MongooseModule.forFeature([{ name: Serveur.name, schema: ServeurSchema }]),
  ],
})
export class ServeurModule { }
