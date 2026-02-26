import 'dotenv/config';
import mongoose from 'mongoose';
import { RefreshToken, RefreshTokenSchema } from '../auth/schemas/refresh-token.schema';
import { BlacklistedToken, BlacklistedTokenSchema } from '../auth/schemas/blacklisted-token.schema';

function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function runCronMaintenance() {
  const uri = process.env['MONGO_URI'];
  if (!uri) {
    throw new Error('MONGO_URI is required');
  }

  const revokedRetentionDays = envNumber('CRON_REVOKED_RETENTION_DAYS', 30);
  const blacklistRetentionDays = envNumber('CRON_BLACKLIST_RETENTION_DAYS', 7);
  const nowMs = Date.now();

  const revokedCutoff = new Date(nowMs - revokedRetentionDays * 24 * 60 * 60 * 1000);
  const blacklistCutoff = new Date(nowMs - blacklistRetentionDays * 24 * 60 * 60 * 1000);

  const wasDisconnected = mongoose.connection.readyState === 0;
  if (wasDisconnected) {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 5,
    });
  }

  try {
    const RefreshTokenModel =
      mongoose.models[RefreshToken.name] ||
      mongoose.model(RefreshToken.name, RefreshTokenSchema);
    const BlacklistedTokenModel =
      mongoose.models[BlacklistedToken.name] ||
      mongoose.model(BlacklistedToken.name, BlacklistedTokenSchema);

    const [revokedDeleted, blacklistDeleted] = await Promise.all([
      RefreshTokenModel.deleteMany({
        revokedAt: { $exists: true, $lte: revokedCutoff },
      }),
      BlacklistedTokenModel.deleteMany({
        expiresAt: { $lte: blacklistCutoff },
      }),
    ]);

    return {
      job: 'cron-maintenance',
      revokedRetentionDays,
      blacklistRetentionDays,
      revokedDeleted: revokedDeleted.deletedCount ?? 0,
      blacklistDeleted: blacklistDeleted.deletedCount ?? 0,
      at: new Date().toISOString(),
    };
  } finally {
    // Important: avoid disconnecting the app-wide mongoose connection when this
    // function is called from the HTTP endpoint in the running API process.
    if (wasDisconnected) {
      await mongoose.disconnect();
    }
  }
}

if (require.main === module) {
  runCronMaintenance()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[cron-maintenance] failed:', message);
      process.exitCode = 1;
    });
}
