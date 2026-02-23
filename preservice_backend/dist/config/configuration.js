"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    database: {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT, 10) || 5432
    },
    auth: {
        accessToken: process.env.JWT_SECRET,
        accessIn: process.env.JWT_EXPIRES_IN,
        refreshToken: process.env.REFRESH_JWT_SECRET,
        refreshIn: process.env.REFRESH_JWT_EXPIRES_IN
    },
    cookies: {
        cookieSecure: process.env.COOKIE_SECURE,
        cookieDomain: process.env.COOKIE_DOMAIN,
    }
});
//# sourceMappingURL=configuration.js.map