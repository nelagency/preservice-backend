import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    create(createEventDto: CreateEventDto): Promise<import("mongoose").FlattenMaps<import("./entities/event.entity").Event & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    findAll(): import("mongoose").Query<(import("mongoose").Document<unknown, {}, import("./entities/event.entity").EventDocument, {}, {}> & import("./entities/event.entity").Event & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, import("./entities/event.entity").EventDocument, {}, {}> & import("./entities/event.entity").Event & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, import("./entities/event.entity").EventDocument, "find", {}>;
    update(id: string, updateEventDto: UpdateEventDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/event.entity").EventDocument, {}, {}> & import("./entities/event.entity").Event & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    kpi(): Promise<{
        label: string;
        value: number;
        difference: number;
        inProgress: boolean;
    }[]>;
    recent(): Promise<(import("mongoose").Document<unknown, {}, import("./entities/event.entity").EventDocument, {}, {}> & import("./entities/event.entity").Event & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    typesPercent(): Promise<{
        label: string;
        count: number;
        percent: number;
    }[]>;
    typesKV(): {
        key: string;
        value: import("./entities/event.entity").EventTypeEnum;
    }[];
    statusesKV(): {
        key: string;
        value: import("./entities/event.entity").EventStatusEnum;
    }[];
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./entities/event.entity").EventDocument, {}, {}> & import("./entities/event.entity").Event & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
}
