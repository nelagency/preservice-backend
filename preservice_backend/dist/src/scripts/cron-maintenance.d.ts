import 'dotenv/config';
export declare function runCronMaintenance(): Promise<{
    job: string;
    revokedRetentionDays: number;
    blacklistRetentionDays: number;
    revokedDeleted: number;
    blacklistDeleted: number;
    at: string;
}>;
