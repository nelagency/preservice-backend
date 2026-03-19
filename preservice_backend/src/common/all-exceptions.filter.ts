// src/common/all-exceptions.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { inspect } from 'util';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  private safePayload(val: unknown) {
    try {
      // tente une serialization "propre"
      JSON.stringify(val);
      return val;
    } catch {
      // replie vers un message simple pour éviter les cycles
      if (val && typeof val === 'object' && 'message' in (val as any)) {
        return { message: (val as any).message };
      }
      return { message: 'Internal error' };
    }
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 🔒 Log sans JSON.stringify (gère les cycles)
    const logBody =
      (exception as any)?.stack ??
      inspect(exception, { depth: 3, breakLength: 120 });
    this.logger.error(`${req.method} ${req.url} -> ${status}\n${logBody}`);

    // 🔒 Payload de réponse sans cycle
    const base =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: (exception as any)?.message ?? 'Internal Server Error' };

    const payload = this.safePayload(base);

    res.status(status).json({
      statusCode: status,
      path: req.url,
      error: payload,
    });
  }
}
