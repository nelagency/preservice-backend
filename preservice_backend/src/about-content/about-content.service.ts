import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateAboutContentDto } from './dto/update-about-content.dto';
import { AboutContent, AboutContentDocument } from './entities/about-content.entity';

@Injectable()
export class AboutContentService {
  constructor(
    @InjectModel(AboutContent.name) private readonly model: Model<AboutContentDocument>,
  ) {}

  async getContent() {
    const existing = await this.model.findOne({ key: 'main' }).lean();
    if (existing) return existing;

    const created = await this.model.create({
      key: 'main',
      vision: '',
      histoire: '',
      valeurs: [],
      founderImages: [],
      sections: [],
    });
    return created.toJSON();
  }

  async updateContent(dto: UpdateAboutContentDto) {
    return this.model.findOneAndUpdate(
      { key: 'main' },
      { $set: dto, $setOnInsert: { key: 'main' } },
      { upsert: true, new: true },
    ).lean();
  }
}

