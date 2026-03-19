import type { Request } from 'express';
export declare function normalizeIp(ip?: string | null): string;
export declare function getClientIp(req: Request): string;
export declare function getAllowedOrigins(env?: NodeJS.ProcessEnv): Set<string>;
export declare function isOriginAllowed(origin: string, allowedOrigins: Set<string>): boolean;
export declare function getAdminAllowedIps(env?: NodeJS.ProcessEnv): string[];
export declare function isAllowedAdminIp(ip: string, env?: NodeJS.ProcessEnv): boolean;
