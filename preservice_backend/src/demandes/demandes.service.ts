import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { UpdateDemandeDto } from './dto/update-demande.dto';
import { Demande, DemandeDocument, DemandeStatusEnum } from './entities/demande.entity';
import { EventTypeEnum } from 'src/events/entities/event.entity';

@Injectable()
export class DemandesService {
  constructor(@InjectModel(Demande.name) private model: Model<DemandeDocument>) { }

  async create(dto: CreateDemandeDto) {
    const payload: any = { ...dto };
    payload.client = new Types.ObjectId(dto.client);
    payload.date_proposee = new Date(dto.date_proposee);
    const created = await this.model.create(payload);
    return created.toJSON();
  }

  async findAll() {
    return this.model.find().sort({ createdAt: -1 }).lean().populate('client', 'nom email');
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).lean().populate('client', 'nom email');
    if (!doc) throw new NotFoundException('Demande not found');
    return doc;
  }

  async update(id: string, dto: UpdateDemandeDto) {
    const payload: any = { ...dto };
    if (dto.client) payload.client = new Types.ObjectId(dto.client);
    if (dto.date_proposee) payload.date_proposee = new Date(dto.date_proposee);
    const updated = await this.model.findByIdAndUpdate(id, payload, { new: true }).lean().populate('client');
    if (!updated) throw new NotFoundException('Demande not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Demande not found');
    return { success: true };
  }

  typesKV() {
    return Object.values(EventTypeEnum).map(v => ({ key: v, value: v }));
  }

  statusesKV() {
    return Object.values(DemandeStatusEnum).map(v => ({ key: v, value: v }));
  }
}
