import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateServiceItemDto } from './dto/create-service-item.dto';
import { UpdateServiceItemDto } from './dto/update-service-item.dto';
import { ServiceItem, ServiceItemDocument } from './entities/service-item.entity';

@Injectable()
export class ServicesContentService {
  constructor(
    @InjectModel(ServiceItem.name) private readonly model: Model<ServiceItemDocument>,
  ) {}

  async findAllPublic() {
    return this.model.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  }

  async findAllAdmin() {
    return this.model.find().sort({ createdAt: -1 }).lean();
  }

  async create(dto: CreateServiceItemDto) {
    const created = await this.model.create(dto);
    return created.toJSON();
  }

  async update(id: string, dto: UpdateServiceItemDto) {
    const updated = await this.model.findByIdAndUpdate(id, dto, { new: true }).lean();
    if (!updated) throw new NotFoundException('Service item not found');
    return updated;
  }
}

