"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCronMaintenance = runCronMaintenance;
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const refresh_token_schema_1 = require("../auth/schemas/refresh-token.schema");
const blacklisted_token_schema_1 = require("../auth/schemas/blacklisted-token.schema");
function envNumber(name, fallback) {
    const raw = process.env[name];
    if (!raw)
        return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
}
async function runCronMaintenance() {
    const uri = process.env['MONGO_URI'];
    if (!uri) {
        throw new Error('MONGO_URI is required');
    }
    const revokedRetentionDays = envNumber('CRON_REVOKED_RETENTION_DAYS', 30);
    const blacklistRetentionDays = envNumber('CRON_BLACKLIST_RETENTION_DAYS', 7);
    const nowMs = Date.now();
    const revokedCutoff = new Date(nowMs - revokedRetentionDays * 24 * 60 * 60 * 1000);
    const blacklistCutoff = new Date(nowMs - blacklistRetentionDays * 24 * 60 * 60 * 1000);
    const wasDisconnected = mongoose_1.default.connection.readyState === 0;
    if (wasDisconnected) {
        await mongoose_1.default.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 5,
        });
    }
    try {
        const RefreshTokenModel = mongoose_1.default.models[refresh_token_schema_1.RefreshToken.name] ||
            mongoose_1.default.model(refresh_token_schema_1.RefreshToken.name, refresh_token_schema_1.RefreshTokenSchema);
        const BlacklistedTokenModel = mongoose_1.default.models[blacklisted_token_schema_1.BlacklistedToken.name] ||
            mongoose_1.default.model(blacklisted_token_schema_1.BlacklistedToken.name, blacklisted_token_schema_1.BlacklistedTokenSchema);
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
    }
    finally {
        if (wasDisconnected) {
            await mongoose_1.default.disconnect();
        }
    }
}
if (require.main === module) {
    runCronMaintenance()
        .then((result) => {
        console.log(JSON.stringify(result, null, 2));
    })
        .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[cron-maintenance] failed:', message);
        process.exitCode = 1;
    });
}
//# sourceMappingURL=cron-maintenance.js.map