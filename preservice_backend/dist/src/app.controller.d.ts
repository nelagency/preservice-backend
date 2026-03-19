import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    health(): {
        ok: boolean;
        ts: number;
    };
    cronMaintenance(key?: string): Promise<{
        job: string;
        revokedRetentionDays: number;
        blacklistRetentionDays: number;
        revokedDeleted: number;
        blacklistDeleted: number;
        at: string;
    }>;
}
