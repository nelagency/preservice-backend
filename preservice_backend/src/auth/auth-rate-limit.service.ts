import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

type Bucket = {
  count: number;
  resetAt: number;
};

@Injectable()
export class AuthRateLimitService {
  private readonly buckets = new Map<string, Bucket>();

  consume(
    key: string,
    options: { limit: number; windowMs: number; message: string },
  ) {
    const now = Date.now();
    const current = this.buckets.get(key);

    if (!current || current.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      return;
    }

    if (current.count >= options.limit) {
      throw new HttpException(options.message, HttpStatus.TOO_MANY_REQUESTS);
    }

    current.count += 1;
    this.buckets.set(key, current);
  }

  reset(key: string) {
    this.buckets.delete(key);
  }
}
