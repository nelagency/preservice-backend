"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
function pick(obj, keys, fallback) {
    for (const k of keys) {
        const v = obj?.[k];
        if (v !== undefined && v !== null)
            return v;
    }
    return fallback;
}
let NotificationsGateway = NotificationsGateway_1 = class NotificationsGateway {
    jwt;
    io;
    constructor(jwt) {
        this.jwt = jwt;
    }
    log = new common_1.Logger(NotificationsGateway_1.name);
    afterInit() {
        this.log.log('NotificationsGateway ready');
    }
    async handleConnection(client) {
        try {
            const raw = (client.handshake.auth?.token ?? client.handshake.query?.token ?? '');
            if (!raw)
                return client.disconnect(true);
            const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
            const payload = this.jwt.verify(token, { secret: process.env.ACCESS_JWT_SECRET });
            const userId = payload.sub;
            if (!userId)
                return client.disconnect(true);
            client.join(`user:${userId}`);
            client.emit('ready', { ok: true });
        }
        catch {
            client.disconnect(true);
        }
    }
    broadcast(userIds, msg) {
        userIds.forEach(uid => this.io.to(`user:${uid}`).emit('notify', msg));
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "io", void 0);
exports.NotificationsGateway = NotificationsGateway = NotificationsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/ws',
        cors: {
            origin: (process.env.WS_CORS_ORIGINS || '*').split(',').map(s => s.trim()),
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway%20copy.js.map