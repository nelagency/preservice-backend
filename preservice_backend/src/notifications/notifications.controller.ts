import { Controller, Get, Patch, Param, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RecipientModel } from './entities/notification.entity';

function inferModel(req: any): RecipientModel {
    const realm = String(req?.user?.realm ?? req?.user?.aud ?? '').toLowerCase();
    const isServeur = realm.includes('serveur') || (!req?.user?.role && (req?.user?.serveurId || req?.user?.srvId));
    return isServeur ? 'Serveur' : 'User';
}

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private svc: NotificationsService) { }

    @Get()
    async list(@Req() req: any, @Query('limit') limit = '50', @Query('before') before?: string) {
        const model = inferModel(req);
        const items = await this.svc.listMine(req.user.sub, model, parseInt(limit, 10) || 50, before);
        return { items };
    }

    @Get('unread-count')
    async unread(@Req() req: any) {
        const model = inferModel(req);
        return { count: await this.svc.unreadCount(req.user.sub, model) };
    }

    @Patch(':id/read')
    async readOne(@Req() req: any, @Param('id') id: string) {
        const model = inferModel(req);
        await this.svc.markRead(req.user.sub, model, id);
        return { ok: true };
    }

    @Patch('read-all')
    async readAll(@Req() req: any) {
        const model = inferModel(req);
        await this.svc.markAllRead(req.user.sub, model);
        return { ok: true };
    }
}