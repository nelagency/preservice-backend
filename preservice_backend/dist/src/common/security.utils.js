"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeIp = normalizeIp;
exports.getClientIp = getClientIp;
exports.getAllowedOrigins = getAllowedOrigins;
exports.isOriginAllowed = isOriginAllowed;
exports.getAdminAllowedIps = getAdminAllowedIps;
exports.isAllowedAdminIp = isAllowedAdminIp;
function parseList(raw) {
    return String(raw ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
}
function normalizeIp(ip) {
    if (!ip)
        return '';
    const firstHop = ip.split(',')[0]?.trim() ?? '';
    if (!firstHop)
        return '';
    if (firstHop === '::1')
        return '127.0.0.1';
    if (firstHop.startsWith('::ffff:'))
        return firstHop.slice(7);
    return firstHop;
}
function getClientIp(req) {
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const cloudflareIp = req.headers['cf-connecting-ip'];
    if (typeof cloudflareIp === 'string')
        return normalizeIp(cloudflareIp);
    if (Array.isArray(cloudflareIp) && cloudflareIp.length) {
        return normalizeIp(cloudflareIp[0]);
    }
    if (typeof forwardedFor === 'string')
        return normalizeIp(forwardedFor);
    if (Array.isArray(forwardedFor) && forwardedFor.length) {
        return normalizeIp(forwardedFor[0]);
    }
    if (typeof realIp === 'string')
        return normalizeIp(realIp);
    if (Array.isArray(realIp) && realIp.length)
        return normalizeIp(realIp[0]);
    return normalizeIp(req.ip);
}
function getAllowedOrigins(env = process.env) {
    const origins = new Set([
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'https://prest-service-front-ashen.vercel.app',
        'https://dasboard.nelagency.com',
        'https://dashboard.nelagency.com',
    ]);
    const deployedOrigin = (env.BACKEND_PUBLIC_URL ||
        env.RENDER_EXTERNAL_URL ||
        '').replace(/\/$/, '');
    if (deployedOrigin)
        origins.add(deployedOrigin);
    for (const origin of parseList(env.CORS_ALLOWED_ORIGINS)) {
        origins.add(origin.replace(/\/$/, ''));
    }
    return origins;
}
function isOriginAllowed(origin, allowedOrigins) {
    if (/^http:\/\/localhost:\d+$/i.test(origin))
        return true;
    if (/^http:\/\/127\.0\.0\.1:\d+$/i.test(origin))
        return true;
    if (/^https:\/\/[a-z0-9-]+\.ngrok-free\.app$/i.test(origin))
        return true;
    if (/^https:\/\/prest-service-front-[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
        return true;
    }
    if (/^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin))
        return true;
    return allowedOrigins.has(origin);
}
function getAdminAllowedIps(env = process.env) {
    return parseList(env.ADMIN_ALLOWED_IPS).map((ip) => normalizeIp(ip));
}
function isAllowedAdminIp(ip, env = process.env) {
    const allowedIps = getAdminAllowedIps(env);
    if (!allowedIps.length) {
        return String(env.NODE_ENV).toLowerCase() !== 'production';
    }
    const normalizedIp = normalizeIp(ip);
    if (!normalizedIp)
        return false;
    return allowedIps.includes(normalizedIp);
}
//# sourceMappingURL=security.utils.js.map