import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger;
    private safePayload;
    catch(exception: unknown, host: ArgumentsHost): void;
}
