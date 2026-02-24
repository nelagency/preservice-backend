import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import cookieParser from 'cookie-parser';
import 'dotenv/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(['error', 'warn', 'log', 'debug']);

  app.setGlobalPrefix('api')

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }))

  app.useGlobalFilters(new AllExceptionsFilter());

  app.use(cookieParser())

  const deployedOrigin = (process.env.BACKEND_PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || '').replace(/\/$/, '');

  const allowedOrigins = new Set([
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://prest-service-front-ashen.vercel.app',
    'https://dasboard.nelagency.com',
    'https://dashboard.nelagency.com'
  ]);
  if (deployedOrigin) allowedOrigins.add(deployedOrigin);

  app.enableCors({
    origin: (origin, cb) => {
      // autorise les requêtes sans Origin (ex: curl / tests)
      if (!origin) return cb(null, true);

      // Autorise tous les sous-domaines ngrok HTTPS
      if (/^https:\/\/[a-z0-9-]+\.ngrok-free\.app$/i.test(origin)) {
        return cb(null, true);
      }
      // Autorise les sous-domaines Render (Swagger hébergé sur le même service).
      if (/^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin)) {
        return cb(null, true);
      }

      if (allowedOrigins.has(origin)) return cb(null, true);

      return cb(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  })

  // Health/info routes for platform pings and manual checks.
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (_req: unknown, res: { status: (code: number) => { json: (body: unknown) => void } }) => {
    res.status(200).json({ service: 'preservice-backend', status: 'ok', docs: '/api/docs' });
  });
  httpAdapter.get('/api', (_req: unknown, res: { status: (code: number) => { json: (body: unknown) => void } }) => {
    res.status(200).json({ service: 'preservice-backend', status: 'ok', docs: '/api/docs' });
  });

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
