import { EventEtatEnum, EventStatusEnum, EventTypeEnum } from '../entities/event.entity';
export declare class CreateEventDto {
    title: string;
    description?: string;
    location: string;
    startdate: string;
    enddate: string;
    type: EventTypeEnum;
    serveurs?: string[];
    guests?: number;
    nbServeur?: number;
    status?: EventStatusEnum;
    etat?: EventEtatEnum;
    amount?: number;
}
