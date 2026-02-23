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
    server;
    log = new common_1.Logger(NotificationsGateway_1.name);
    constructor(jwt) {
        this.jwt = jwt;
    }
    afterInit() {
        this.log.log('NotificationsGateway ready');
    }
    handleConnection(client) {
        try {
            const bearer = client.handshake.auth?.token ||
                client.handshake.headers?.authorization ||
                '';
            const token = (bearer || '').replace(/^Bearer\s+/i, '').trim();
            if (!token)
                throw new Error('No token');
            const secrets = [
                process.env.JWT_SECRET,
                process.env.JWT_ACCESS_SECRET,
                process.env.SERVEURS_ACCESS_JWT_SECRET,
                process.env.SERVEUR_ACCESS_JWT_SECRET,
                process.env.AUTH_JWT_SECRET,
            ].filter(Boolean);
            let payload;
            let lastError;
            for (const s of secrets.length ? secrets : [undefined]) {
                try {
                    payload = s ? this.jwt.verify(token, { secret: s }) : this.jwt.decode(token);
                    if (payload)
                        break;
                }
                catch (e) {
                    lastError = e;
                }
            }
            if (!payload)
                throw lastError || new Error('Invalid token');
            const realm = pick(payload, ['realm', 'aud']) ||
                (payload?.role ? 'user' : 'serveur');
            let id = pick(payload, ['sub', 'userId', '_id', 'id'])
                || (realm === 'serveur' ? pick(payload, ['serveurId', 'serveur', 'srvId']) : undefined);
            if (!id)
                throw new Error('No subject id in token');
            const room = realm === 'serveur' ? `s:${id}` : `u:${id}`;
            client.join(room);
            client.emit('ready', { ok: true, realm, id });
            this.log.log(`Socket joined ${room}`);
        }
        catch (e) {
            this.log.warn(`WS handshake failed: ${e?.message || e}`);
            client.emit('ready', { ok: false, error: 'unauthorized' });
            client.disconnect();
        }
    }
    handleDisconnect(client) {
    }
    broadcast(userIds, data) {
        const ids = (userIds || []).filter(Boolean);
        for (const id of ids)
            this.server.to(`u:${id}`).emit('notify', data);
    }
    emitToUsers(userIds, data) {
        for (const id of userIds)
            this.server.to(`u:${id}`).emit('notify', data);
    }
    emitToServeurs(serveurIds, data) {
        for (const id of serveurIds)
            this.server.to(`s:${id}`).emit('notify', data);
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
exports.NotificationsGateway = NotificationsGateway = NotificationsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/ws',
        cors: { origin: '*', credentials: true },
        transports: ['websocket'],
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map