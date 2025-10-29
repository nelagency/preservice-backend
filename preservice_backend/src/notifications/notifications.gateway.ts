import {
    WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets';
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
    cors: { origin: '*', credentials: true },
    transports: ['websocket'],
})
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server!: Server;
    private readonly log = new Logger(NotificationsGateway.name);

    constructor(private readonly jwt: JwtService) { }

    afterInit() {
        this.log.log('NotificationsGateway ready');
    }

    handleConnection(client: Socket) {
        try {
            // Récup du token envoyé côté client: auth.token = 'Bearer <JWT>'
            const bearer =
                (client.handshake.auth?.token as string) ||
                (client.handshake.headers?.authorization as string) ||
                '';

            const token = (bearer || '').replace(/^Bearer\s+/i, '').trim();
            if (!token) throw new Error('No token');

            // On essaie plusieurs secrets si tu en as 2 (user vs serveur)
            const secrets = [
                process.env.JWT_SECRET,
                process.env.JWT_ACCESS_SECRET,
                process.env.SERVEURS_ACCESS_JWT_SECRET,
                process.env.SERVEUR_ACCESS_JWT_SECRET,
                process.env.AUTH_JWT_SECRET,
            ].filter(Boolean) as string[];

            let payload: any;
            let lastError: any;
            for (const s of secrets.length ? secrets : [undefined]) {
                try {
                    payload = s ? this.jwt.verify(token, { secret: s }) : this.jwt.decode(token);
                    if (payload) break;
                } catch (e) {
                    lastError = e;
                }
            }
            if (!payload) throw lastError || new Error('Invalid token');

            // Déduire realm & id
            const realm =
                pick<string>(payload, ['realm', 'aud']) ||
                (payload?.role ? 'user' : 'serveur'); // heuristique si pas de realm

            let id =
                pick<string>(payload, ['sub', 'userId', '_id', 'id'])
                || (realm === 'serveur' ? pick<string>(payload, ['serveurId', 'serveur', 'srvId']) : undefined);

            if (!id) throw new Error('No subject id in token');

            // Rooms par type: users -> u:<id>, serveurs -> s:<id>
            const room = realm === 'serveur' ? `s:${id}` : `u:${id}`;
            client.join(room);

            client.emit('ready', { ok: true, realm, id });
            this.log.log(`Socket joined ${room}`);
        } catch (e: any) {
            this.log.warn(`WS handshake failed: ${e?.message || e}`);
            client.emit('ready', { ok: false, error: 'unauthorized' });
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        // rien de spécial à faire ici
    }

    /** Compat historique: broadcast à une liste de User._id */
    broadcast(userIds: (string | undefined)[], data: any) {
        const ids = (userIds || []).filter(Boolean) as string[];
        for (const id of ids) this.server.to(`u:${id}`).emit('notify', data);
    }

    /** Envoi ciblé: Users */
    emitToUsers(userIds: string[], data: any) {
        for (const id of userIds) this.server.to(`u:${id}`).emit('notify', data);
    }

    /** Envoi ciblé: Serveurs */
    emitToServeurs(serveurIds: string[], data: any) {
        for (const id of serveurIds) this.server.to(`s:${id}`).emit('notify', data);
    }
}