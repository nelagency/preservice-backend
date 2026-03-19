import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash } from 'crypto';
import { Model, Types } from 'mongoose';
import {
  BlacklistedToken,
  BlacklistedTokenDocument,
} from './schemas/blacklisted-token.schema';

function sha256(input: string) {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

@Injectable()
export class TokenBlacklistService {
  constructor(
    @InjectModel(BlacklistedToken.name)
    private model: Model<BlacklistedTokenDocument>,
  ) {}

  async add(token: string, userId: string | null, expSeconds: number) {
    if (!token || !expSeconds) return;
    const tokenHash = sha256(token);
    const expiresAt = new Date(expSeconds * 1000);
    await this.model.updateOne(
      { tokenHash },
      {
        $set: {
          tokenHash,
          userId: userId ? new Types.ObjectId(userId) : undefined,
          expiresAt,
        },
      },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  async has(token: string): Promise<boolean> {
    const tokenHash = sha256(token);
    const exists = await this.model.exists({ tokenHash });
    return !!exists;
  }
}
