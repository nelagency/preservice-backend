export declare class AuthRateLimitService {
    private readonly buckets;
    consume(key: string, options: {
        limit: number;
        windowMs: number;
        message: string;
    }): void;
    reset(key: string): void;
}
