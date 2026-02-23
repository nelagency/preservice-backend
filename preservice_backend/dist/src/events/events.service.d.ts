import { Model } from 'mongoose';
import { Event, EventDocument, EventStatusEnum, EventTypeEnum } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
export declare class EventsService {
    private model;
    private readonly notif;
    constructor(model: Model<EventDocument>, notif: NotificationsService);
    create(dto: CreateEventDto): Promise<import("mongoose").FlattenMaps<Event & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    createEvent(dto: CreateEventDto, authorId: string, serveurIdsCiblés: string[]): Promise<import("mongoose").FlattenMaps<Event & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    findAll(): import("mongoose").Query<(import("mongoose").Document<unknown, {}, EventDocument, {}, {}> & Event & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, EventDocument, {}, {}> & Event & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, EventDocument, "find", {}>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, EventDocument, {}, {}> & Event & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: UpdateEventDto): Promise<import("mongoose").Document<unknown, {}, EventDocument, {}, {}> & Event & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    kpi(): Promise<{
        label: string;
        value: any;
        difference: number;
        inProgress: boolean;
    }[]>;
    recent(): Promise<(import("mongoose").Document<unknown, {}, EventDocument, {}, {}> & Event & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    typesPercent(): Promise<{
        label: string;
        count: any;
        percent: number;
    }[]>;
    typesKV(): {
        key: string;
        value: EventTypeEnum;
    }[];
    statusesKV(): {
        key: string;
        value: EventStatusEnum;
    }[];
}
