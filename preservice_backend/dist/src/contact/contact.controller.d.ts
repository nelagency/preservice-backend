import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { UpdateContactMessageStatusDto } from './dto/update-contact-message-status.dto';
export declare class ContactController {
    private readonly contactService;
    constructor(contactService: ContactService);
    create(dto: CreateContactMessageDto): Promise<import("mongoose").FlattenMaps<import("./entities/contact-message.entity").ContactMessage & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & {
        createdAt: Date;
        updatedAt: Date;
    } & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    findAll(): Promise<(import("mongoose").FlattenMaps<import("./entities/contact-message.entity").ContactMessageDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    updateStatus(id: string, dto: UpdateContactMessageStatusDto): Promise<import("mongoose").FlattenMaps<import("./entities/contact-message.entity").ContactMessageDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
}
