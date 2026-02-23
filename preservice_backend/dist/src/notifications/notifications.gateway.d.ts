import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
export declare class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwt;
    server: Server;
    private readonly log;
    constructor(jwt: JwtService);
    afterInit(): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    broadcast(userIds: (string | undefined)[], data: any): void;
    emitToUsers(userIds: string[], data: any): void;
    emitToServeurs(serveurIds: string[], data: any): void;
}
