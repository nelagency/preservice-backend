import { CreateServiceItemDto } from './dto/create-service-item.dto';
import { UpdateServiceItemDto } from './dto/update-service-item.dto';
import { ServicesContentService } from './services-content.service';
export declare class ServicesContentController {
    private readonly servicesContentService;
    constructor(servicesContentService: ServicesContentService);
    findAllPublic(): Promise<(import("mongoose").FlattenMaps<import("./entities/service-item.entity").ServiceItemDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    findAllAdmin(): Promise<(import("mongoose").FlattenMaps<import("./entities/service-item.entity").ServiceItemDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    create(dto: CreateServiceItemDto): Promise<import("mongoose").FlattenMaps<import("./entities/service-item.entity").ServiceItem & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & {
        createdAt: Date;
        updatedAt: Date;
    } & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    update(id: string, dto: UpdateServiceItemDto): Promise<import("mongoose").FlattenMaps<import("./entities/service-item.entity").ServiceItemDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
}
