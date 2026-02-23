import { StatsService } from './stats.service';
export declare class StatsController {
    private readonly svc;
    constructor(svc: StatsService);
    overview(): Promise<import("./dto/overview.dto").OverviewDto>;
}
