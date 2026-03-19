import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

  async create(dto: CreateUserDto) {
    // le pre('save') hashera automatiquement
    const created = new this.model(dto as any);
    await created.save();
    return created.toJSON();
  }

  async findAll() {
    return this.model.find().sort({ createdAt: -1 }).lean();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).lean();
    if (!doc) throw new NotFoundException('User not found');
    return doc;
  }

  async update(id: string, dto: UpdateUserDto) {
    const payload: any = { ...dto };
    if (dto.mot_passe) {
      const salt = await bcrypt.genSalt(10);
      payload.mot_passe = await bcrypt.hash(dto.mot_passe, salt);
    }
    const updated = await this.model
      .findByIdAndUpdate(id, payload, { new: true })
      .lean();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('User not found');
    return { success: true };
  }

  rolesKV() {
    return Object.entries(UserRole).map(([key, value]) => ({ key, value }));
  }
}
