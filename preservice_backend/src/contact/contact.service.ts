import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { UpdateContactMessageStatusDto } from './dto/update-contact-message-status.dto';
import { ContactMessage, ContactMessageDocument } from './entities/contact-message.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(ContactMessage.name) private readonly model: Model<ContactMessageDocument>,
  ) {}

  async create(dto: CreateContactMessageDto) {
    const created = await this.model.create(dto);
    return created.toJSON();
  }

  async findAll() {
    return this.model.find().sort({ createdAt: -1 }).lean();
  }

  async updateStatus(id: string, dto: UpdateContactMessageStatusDto) {
    const updated = await this.model.findByIdAndUpdate(
      id,
      { status: dto.status },
      { new: true },
    ).lean();

    if (!updated) throw new NotFoundException('Contact message not found');
    return updated;
  }
}

