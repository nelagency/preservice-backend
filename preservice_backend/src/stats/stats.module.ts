import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Event, EventSchema } from 'src/events/entities/event.entity';
import { Demande, DemandeSchema } from 'src/demandes/entities/demande.entity';
import { Avi, AvisSchema } from 'src/avis/entities/avi.entity';
import { Participation, ParticipationSchema } from 'src/participation/entities/participation.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Event.name, schema: EventSchema },
            { name: Participation.name, schema: ParticipationSchema },
            { name: Demande.name, schema: DemandeSchema },
            { name: Avi.name, schema: AvisSchema },
        ]),
    ],
    controllers: [StatsController],
    providers: [StatsService],
})
export class StatsModule { }