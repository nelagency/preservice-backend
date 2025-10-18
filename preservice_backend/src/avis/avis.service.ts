import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateAviDto } from './dto/create-avi.dto';
import { UpdateAviDto } from './dto/update-avi.dto';
import { Avi, AvisDocument } from './entities/avi.entity';

@Injectable()
export class AvisService {
  constructor(@InjectModel(Avi.name) private model: Model<AvisDocument>) { }

  async create(dto: CreateAviDto) {
    const payload: any = {
      note: dto.note,
      commentaire: dto.commentaire,
      client: new Types.ObjectId(dto.client),
      event: new Types.ObjectId(dto.event),
      etat: dto.etat ?? true,
    };
    const created = await this.model.create(payload);
    return created.toJSON();
  }

  async findAll() {
    return this.model
      .find()
      .sort({ createdAt: -1 })
      .populate({ path: 'client', select: 'nom prenom email' })
      .populate({ path: 'event', select: 'type startdate enddate createdAt' })
      .lean();
  }

  async findOne(id: string) {
    const doc = await this.model
      .findById(id)
      .populate({ path: 'client', select: 'nom prenom email' })
      .populate({ path: 'event', select: 'type startdate enddate createdAt' })
      .lean();
    if (!doc) throw new NotFoundException('Avis not found');
    return doc;
  }

  async update(id: string, dto: UpdateAviDto) {
    const payload: any = { ...dto };
    if (dto.client) payload.client = new Types.ObjectId(dto.client);
    if (dto.event) payload.event = new Types.ObjectId(dto.event);

    const updated = await this.model.findByIdAndUpdate(id, payload, { new: true }).lean().populate('client', 'event');
    if (!updated) throw new NotFoundException('Avis not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Avis not found');
    return { success: true };
  }
}
