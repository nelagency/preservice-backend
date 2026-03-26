import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import type { Request, Response, NextFunction } from 'express';
import {
  getAllowedOrigins,
  getClientIp,
  isAllowedAdminIp,
  isOriginAllowed,
} from './common/security.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();
  const swaggerCsp = [
    "default-src 'self'",
    "base-uri 'self'",
    "img-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  expressApp.set('trust proxy', 1);
  expressApp.disable('x-powered-by');

  app.useLogger(['error', 'warn', 'log', 'debug']);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.use(cookieParser());
  const allowedOrigins = getAllowedOrigins();

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), browsing-topics=()',
    );
    const isSwaggerPath = req.path.startsWith('/api/docs');
    res.setHeader(
      'Content-Security-Policy',
      isSwaggerPath
        ? swaggerCsp
        : "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    );
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    if (req.secure) {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload',
      );
    }

    const ip = getClientIp(req);
    if (req.path.startsWith('/api/docs') && !isAllowedAdminIp(ip)) {
      res.status(403).json({ message: 'Access denied from this IP' });
      return;
    }

    next();
  });

  app.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (isOriginAllowed(origin, allowedOrigins)) return cb(null, true);

      return cb(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get(
    '/',
    (
      _req: unknown,
      res: { status: (code: number) => { json: (body: unknown) => void } },
    ) => {
      res.status(200).json({
        service: 'preservice-backend',
        status: 'ok',
        docs: '/api/docs',
      });
    },
  );
  httpAdapter.get(
    '/api',
    (
      _req: unknown,
      res: { status: (code: number) => { json: (body: unknown) => void } },
    ) => {
      res.status(200).json({
        service: 'preservice-backend',
        status: 'ok',
        docs: '/api/docs',
      });
    },
  );

  const config = new DocumentBuilder()
    .setTitle('PrestService API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  const publicBaseUrl =
    process.env.BACKEND_PUBLIC_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    `http://localhost:${port}`;

  console.log(`API: ${publicBaseUrl}/api | Swagger: ${publicBaseUrl}/api/docs`);
}

bootstrap();
