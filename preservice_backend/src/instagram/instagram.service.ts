import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InstagramPost, InstagramPostDocument } from './entities/instagram-post.entity';
import { CreateInstagramPostDto } from './dto/create-instagram-post.dto';
import { UpdateInstagramPostDto } from './dto/update-instagram-post.dto';

@Injectable()
export class InstagramService {
  constructor(
    @InjectModel(InstagramPost.name) private readonly model: Model<InstagramPostDocument>,
  ) {}

  findAll() {
    return this.model.find({ isActive: true }).sort({ postedAt: -1, createdAt: -1 }).lean();
  }

  async create(dto: CreateInstagramPostDto) {
    const created = await this.model.create({
      ...dto,
      postedAt: dto.postedAt ? new Date(dto.postedAt) : undefined,
    });
    return created.toJSON();
  }

  async update(id: string, dto: UpdateInstagramPostDto) {
    const updated = await this.model
      .findByIdAndUpdate(
        id,
        {
          ...dto,
          postedAt: dto.postedAt ? new Date(dto.postedAt) : undefined,
        },
        { new: true },
      )
      .lean();
    if (!updated) throw new NotFoundException('Instagram post not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Instagram post not found');
    return { success: true };
  }
}
