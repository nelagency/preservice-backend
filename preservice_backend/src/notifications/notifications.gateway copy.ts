import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

function pick<T = any>(obj: any, keys: string[], fallback?: any): T | undefined {
    for (const k of keys) {
        const v = obj?.[k];
        if (v !== undefined && v !== null) return v as T;
    }
    return fallback;
}

@WebSocketGateway({
    namespace: '/ws',
    cors: {
        origin: (process.env.WS_CORS_ORIGINS || '*').split(',').map(s => s.trim()),
        credentials: true,
    },
})
export class NotificationsGateway implements OnGatewayConnection {
    @WebSocketServer() io!: Server;
    constructor(private jwt: JwtService) { }
    private readonly log = new Logger(NotificationsGateway.name);

    afterInit() {
        this.log.log('NotificationsGateway ready');
    }

    async handleConnection(client: Socket) {
        try {
            const raw = (client.handshake.auth?.token ?? client.handshake.query?.token ?? '') as string | undefined;
            
            if (!raw) return client.disconnect(true);
            const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
            const payload = this.jwt.verify(token, { secret: process.env.ACCESS_JWT_SECRET! });
            const userId = payload.sub as string;
            if (!userId) return client.disconnect(true);
            client.join(`user:${userId}`);
            client.emit('ready', { ok: true });
        } catch {
            client.disconnect(true);
        }
    }

    broadcast(userIds: string[], msg: any) {
        userIds.forEach(uid => this.io.to(`user:${uid}`).emit('notify', msg));
    }
}