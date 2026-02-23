import { Model } from 'mongoose';
import { OverviewDto } from './dto/overview.dto';
import { EventDocument } from 'src/events/entities/event.entity';
import { DemandeDocument } from 'src/demandes/entities/demande.entity';
import { AvisDocument } from 'src/avis/entities/avi.entity';
import { ParticipationDocument } from 'src/participation/entities/participation.entity';
export declare class StatsService {
    private events;
    private demandes;
    private parts;
    private avis;
    constructor(events: Model<EventDocument>, demandes: Model<DemandeDocument>, parts: Model<ParticipationDocument>, avis: Model<AvisDocument>);
    private revenueExpr;
    overview(): Promise<OverviewDto>;
    private ratioConfirmed;
    private candidaturesParEvent;
    private affectationsConfirmees;
}
