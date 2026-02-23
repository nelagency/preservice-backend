import { EventTypeEnum } from 'src/events/entities/event.entity';
import { DemandeStatusEnum } from '../entities/demande.entity';
export declare class CreateDemandeDto {
    client: string;
    type: EventTypeEnum;
    date_proposee: string;
    nb_serveurs?: number;
    status?: DemandeStatusEnum;
}
