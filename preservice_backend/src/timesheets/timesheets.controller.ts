import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { TimesheetsService } from './timesheets.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { ReviewTimesheetDto } from './dto/review-timesheet.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PayTimesheetDto } from './dto/pay-timesheet.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class TimesheetsController {
    constructor(private readonly svc: TimesheetsService) { }

    // serveur : créer/maj sa feuille d'heures
    @Post('events/:eventId/timesheets')
    async submit(@Param('eventId') eventId: string, @Req() req: any, @Body() dto: CreateTimesheetDto) {
        return this.svc.submitForEvent(eventId, req.user.sub, dto);
    }

    // serveur : récupérer sa feuille
    @Get('events/:eventId/timesheets/mine')
    async mine(@Param('eventId') eventId: string, @Req() req: any) {
        return this.svc.getMineForEvent(eventId, req.user.sub);
    }

    // admin : lister en attente
    @UseGuards(RolesGuard) @Roles('superadmin', 'admin')
    @Get('admin/timesheets')
    async pending(@Query('status') status = 'submitted') {
        if (status === 'submitted') return this.svc.listPending();
        // tu peux étendre pour d'autres filtres
        return this.svc.listPending();
    }

    // admin : valider / rejeter
    @UseGuards(RolesGuard) @Roles('superadmin', 'admin')
    @Patch('admin/timesheets/:id/review')
    async review(@Param('id') id: string, @Req() req: any, @Body() body: ReviewTimesheetDto) {
        return this.svc.review(id, req.user.sub, body);
    }

    // ---- NEW: admin : enregistrer un paiement ----
    @UseGuards(RolesGuard) @Roles('superadmin', 'admin')
    @Patch('admin/timesheets/:id/pay')
    async payOne(@Param('id') id: string, @Req() req: any, @Body() body: PayTimesheetDto) {
        return this.svc.pay(id, req.user.sub, body);
    }

    // historiques
    @Get('me/timesheets') @UseGuards(RolesGuard) @Roles('serveur')
    async myHistory(@Req() req: any) {
        //const list = this.svc.listForServeur(req.user.sub);
        //return list;
        const serveurId = req.user?.serveurId ?? req.user?.sub; // <--- accepte les 2
        return this.svc.listForServeur(serveurId);
        // ou: return this.svc.listForServeurSmart(serveurId);  // si tu as mis la variante "Smart"
    }
    @UseGuards(RolesGuard) @Roles('superadmin', 'admin')
    @Get('events/:eventId/timesheets')
    async eventHistory(@Param('eventId') eventId: string) {
        return this.svc.listForEvent(eventId);
    }
}