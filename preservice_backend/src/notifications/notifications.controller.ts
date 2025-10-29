import { Controller, Get, Patch, Param, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private svc: NotificationsService) { }

    @Get()
    async list(@Req() req: any, @Query('limit') limit = '50', @Query('before') before?: string) {
        const items = await this.svc.listMine(req.user.sub, parseInt(limit, 10) || 50, before);
        return { items };
    }

    @Get('unread-count')
    async unread(@Req() req: any) {
        return { count: await this.svc.unreadCount(req.user.sub) };
    }

    @Patch(':id/read')
    async readOne(@Req() req: any, @Param('id') id: string) {
        await this.svc.markRead(req.user.sub, id);
        return { ok: true };
    }

    @Patch('read-all')
    async readAll(@Req() req: any) {
        await this.svc.markAllRead(req.user.sub);
        return { ok: true };
    }
}