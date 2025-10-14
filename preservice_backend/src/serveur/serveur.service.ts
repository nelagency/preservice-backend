import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateServeurDto } from './dto/create-serveur.dto';
import { UpdateServeurDto } from './dto/update-serveur.dto';
import { Serveur, ServeurDocument, ServeurStatus } from './entities/serveur.entity';
import * as bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
const sanitizeEmail = (e?: string) => (e ?? '').trim().toLowerCase();

@Injectable()
export class ServeurService {
  constructor(@InjectModel(Serveur.name) private model: Model<ServeurDocument>) { }

  /** CRUD par défaut **/
  async create(dto: CreateServeurDto) {
    const email = sanitizeEmail(dto.email);
    const exists = await this.model.exists({ email });
    if (exists) throw new ConflictException('Email déjà utilisé');

    const hashed = await bcrypt.hash(dto.mot_passe, SALT_ROUNDS);
    const created = await this.model.create({
      ...dto,
      email,
      mot_passe: hashed
    });
    const plain = created.toObject();
    delete (plain as any).mot_passe;
    return plain;
  }

  findAll() {
    return this.model.find({}, { mot_passe: 0 }).sort({ nom: 1, prenom: 1 }).lean();;
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id, { mot_passe: 0 }).lean();
    if (!doc) throw new NotFoundException('Serveur not found');
    return doc;
  }

  async update(id: string, dto: UpdateServeurDto) {
    const update = { ...dto };
    if (dto.email) {
      update.email = sanitizeEmail(dto.email);
      const conflict = await this.model.exists({ _id: { $ne: id }, email: update.email });
      if (conflict) throw new ConflictException('Email déjà utilisé');
    }
    if (dto.mot_passe) {
      update.mot_passe = await bcrypt.hash(dto.mot_passe, SALT_ROUNDS);
    }
    const updated1 = await this.model.findByIdAndUpdate(id, { $set: update }, { new: true, fields: { mot_passe: 0 } }).lean();
    if (!updated1) throw new NotFoundException('Serveur not found');
    return updated1;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Serveur not found');
    return { success: true };
  }

  /** Statuts de serveur (key/value) **/
  serveurStatusesKV() {
    return Object.entries(ServeurStatus).map(([key, value]) => ({ key, value }));
  }
}
