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
const security_utils_1 = require("./common/security.utils");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', 1);
    expressApp.disable('x-powered-by');
    app.useLogger(['error', 'warn', 'log', 'debug']);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.use((0, cookie_parser_1.default)());
    const allowedOrigins = (0, security_utils_1.getAllowedOrigins)();
    app.use((req, res, next) => {
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');
        res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
        res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
        if (req.secure) {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }
        const ip = (0, security_utils_1.getClientIp)(req);
        if (req.path.startsWith('/api/docs') && !(0, security_utils_1.isAllowedAdminIp)(ip)) {
            res.status(403).json({ message: 'Access denied from this IP' });
            return;
        }
        next();
    });
    app.enableCors({
        origin: (origin, cb) => {
            if (!origin)
                return cb(null, true);
            if ((0, security_utils_1.isOriginAllowed)(origin, allowedOrigins))
                return cb(null, true);
            return cb(new Error(`CORS blocked for origin: ${origin}`), false);
        },
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Authorization',
    });
    const httpAdapter = app.getHttpAdapter();
    httpAdapter.get('/', (_req, res) => {
        res.status(200).json({
            service: 'preservice-backend',
            status: 'ok',
            docs: '/api/docs',
        });
    });
    httpAdapter.get('/api', (_req, res) => {
        res.status(200).json({
            service: 'preservice-backend',
            status: 'ok',
            docs: '/api/docs',
        });
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('PrestService API')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port);
    const publicBaseUrl = process.env.BACKEND_PUBLIC_URL ||
        process.env.RENDER_EXTERNAL_URL ||
        `http://localhost:${port}`;
    console.log(`API: ${publicBaseUrl}/api | Swagger: ${publicBaseUrl}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map