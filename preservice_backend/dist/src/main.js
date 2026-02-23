"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const all_exceptions_filter_1 = require("./common/all-exceptions.filter");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
require("dotenv/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useLogger(['error', 'warn', 'log', 'debug']);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.use((0, cookie_parser_1.default)());
    const allowedOrigins = new Set([
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'https://prest-service-front-ashen.vercel.app',
        'https://dasboard.nelagency.com'
    ]);
    app.enableCors({
        origin: (origin, cb) => {
            if (!origin)
                return cb(null, true);
            if (/^https:\/\/[a-z0-9-]+\.ngrok-free\.app$/i.test(origin)) {
                return cb(null, true);
            }
            if (allowedOrigins.has(origin))
                return cb(null, true);
            return cb(new Error(`CORS blocked for origin: ${origin}`), false);
        },
        credentials: true,
        ethods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Authorization',
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('PrestService API')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.listen(process.env.PORT ?? 3000);
    console.log(`🚀 http://51.77.200.96:${process.env.PORT || 3000} | Swagger /docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map