import { Model } from 'mongoose';
import { CreateServiceItemDto } from './dto/create-service-item.dto';
import { UpdateServiceItemDto } from './dto/update-service-item.dto';
import { ServiceItem, ServiceItemDocument } from './entities/service-item.entity';
export declare class ServicesContentService {
    private readonly model;
    constructor(model: Model<ServiceItemDocument>);
    findAllPublic(): Promise<(import("mongoose").FlattenMaps<ServiceItemDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    findAllAdmin(): Promise<(import("mongoose").FlattenMaps<ServiceItemDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    create(dto: CreateServiceItemDto): Promise<import("mongoose").FlattenMaps<ServiceItem & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & {
        createdAt: Date;
        updatedAt: Date;
    } & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    update(id: string, dto: UpdateServiceItemDto): Promise<import("mongoose").FlattenMaps<ServiceItemDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
}
