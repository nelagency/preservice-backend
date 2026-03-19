import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
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
  constructor(private readonly svc: TimesheetsService) {}

  @Post('events/:eventId/timesheets')
  async submit(
    @Param('eventId') eventId: string,
    @Req() req: any,
    @Body() dto: CreateTimesheetDto,
  ) {
    return this.svc.submitForEvent(eventId, req.user.sub, dto);
  }

  @Get('events/:eventId/timesheets/mine')
  async mine(@Param('eventId') eventId: string, @Req() req: any) {
    return this.svc.getMineForEvent(eventId, req.user.sub);
  }

  @UseGuards(RolesGuard)
  @Roles('superadmin', 'admin')
  @Get('admin/timesheets')
  async pending(@Query('status') status = 'submitted') {
    if (status === 'submitted') return this.svc.listPending();
    return this.svc.listPending();
  }

  @UseGuards(RolesGuard)
  @Roles('superadmin', 'admin')
  @Get('admin/serveurs/:serveurId/timesheets')
  async serveurHistory(@Param('serveurId') serveurId: string) {
    return this.svc.listForServeur(serveurId);
  }

  @UseGuards(RolesGuard)
  @Roles('superadmin', 'admin')
  @Patch('admin/timesheets/:id/review')
  async review(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: ReviewTimesheetDto,
  ) {
    return this.svc.review(id, req.user.sub, body);
  }

  @UseGuards(RolesGuard)
  @Roles('superadmin', 'admin')
  @Patch('admin/timesheets/:id/pay')
  async payOne(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: PayTimesheetDto,
  ) {
    return this.svc.pay(id, req.user.sub, body);
  }

  @Get('me/timesheets')
  @UseGuards(RolesGuard)
  @Roles('serveur')
  async myHistory(@Req() req: any) {
    const serveurId = req.user?.serveurId ?? req.user?.sub;
    return this.svc.listForServeur(serveurId);
  }

  @UseGuards(RolesGuard)
  @Roles('superadmin', 'admin')
  @Get('events/:eventId/timesheets')
  async eventHistory(@Param('eventId') eventId: string) {
    return this.svc.listForEvent(eventId);
  }
}
