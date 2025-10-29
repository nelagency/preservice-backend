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

  const allowedOrigins = new Set([
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://prest-service-front-ashen.vercel.app'
  ]);

  app.enableCors({
    origin: (origin, cb) => {
      // autorise les requêtes sans Origin (ex: curl / tests)
      if (!origin) return cb(null, true);

      // Autorise tous les sous-domaines ngrok HTTPS
      if (/^https:\/\/[a-z0-9-]+\.ngrok-free\.app$/i.test(origin)) {
        return cb(null, true);
      }

      if (allowedOrigins.has(origin)) return cb(null, true);

      return cb(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    ethods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  })

  const config = new DocumentBuilder()
    .setTitle('PrestService API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);

  console.log(`🚀 http://51.77.200.96:${process.env.PORT || 3000} | Swagger /docs`);
}

bootstrap();