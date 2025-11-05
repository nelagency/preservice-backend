import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class R2Service {
  private s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  private bucket = process.env.R2_BUCKET!;

  buildObjectKey(opts: { eventId?: string; filename: string }) {
    const base = opts.eventId ? `events/${opts.eventId}` : 'unassigned';
    const safe = opts.filename.replace(/[^^\w.\-]+/g, '_');
    return `${base}/${randomUUID()}-${safe}`;
  }

  async presignPut(key: string, contentType: string, expiresSeconds = 900) {
    const cmd = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
    const url = await getSignedUrl(this.s3, cmd, { expiresIn: expiresSeconds });
    return { url, headers: { 'Content-Type': contentType } };
  }

  publicUrl(key: string) {
    const base = process.env.R2_PUBLIC_BASE_URL;
    return base ? `${base.replace(/\/$/, '')}/${encodeURI(key)}` : null;
  }
}