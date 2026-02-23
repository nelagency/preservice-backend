import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private svc;
    constructor(svc: NotificationsService);
    list(req: any, limit?: string, before?: string): Promise<{
        items: (import("mongoose").FlattenMaps<import("./entities/notification.entity").NotificationDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    unread(req: any): Promise<{
        count: number;
    }>;
    readOne(req: any, id: string): Promise<{
        ok: boolean;
    }>;
    readAll(req: any): Promise<{
        ok: boolean;
    }>;
}
