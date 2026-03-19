import { Model } from 'mongoose';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { UpdateContactMessageStatusDto } from './dto/update-contact-message-status.dto';
import { ContactMessage, ContactMessageDocument } from './entities/contact-message.entity';
export declare class ContactService {
    private readonly model;
    constructor(model: Model<ContactMessageDocument>);
    create(dto: CreateContactMessageDto): Promise<import("mongoose").FlattenMaps<ContactMessage & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & {
        createdAt: Date;
        updatedAt: Date;
    } & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    findAll(): Promise<(import("mongoose").FlattenMaps<ContactMessageDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    updateStatus(id: string, dto: UpdateContactMessageStatusDto): Promise<import("mongoose").FlattenMaps<ContactMessageDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
}
