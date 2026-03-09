import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ParticipationService } from './participation.service';
import { ApplyDto, ApproveDto, AssignDto, BulkAssignDto } from './dto/create-participation.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Participations')
@ApiBearerAuth()
@Controller('events/:eventId/participations')
export class ParticipationController {
  constructor(private readonly svc: ParticipationService) {}

  @Post('apply')
  @ApiOperation({ summary: 'Soumettre une candidature', operationId: 'participationsApply' })
  @ApiParam({ name: 'eventId', description: "Identifiant de l'événement" })
  @ApiBody({ type: ApplyDto })
  @ApiCreatedResponse({ description: 'Candidature enregistrée.' })
  @Roles('serveur', 'admin', 'superadmin')
  apply(@Param('eventId') eventId: string, @Body() dto: ApplyDto) {
    return this.svc.apply(eventId, dto.serveurId, dto.notes);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Valider / rejeter une candidature', operationId: 'participationsApprove' })
  @ApiParam({ name: 'eventId', description: "Identifiant de l'événement" })
  @ApiParam({ name: 'id', description: 'Identifiant de la participation' })
  @ApiBody({ type: ApproveDto })
  @ApiOkResponse({ description: 'Candidature mise à jour.' })
  @Roles('admin', 'superadmin')
  approve(@Param('eventId') eventId: string, @Param('id') id: string, @Body() dto: ApproveDto, @Req() req: any) {
    return this.svc.setCandidatureStatusEvent(eventId, id, dto.status, req.user.sub);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assigner un serveur à un poste', operationId: 'participationsAssign' })
  @ApiParam({ name: 'eventId', description: "Identifiant de l'événement" })
  @ApiParam({ name: 'id', description: 'Identifiant de la participation' })
  @ApiBody({ type: AssignDto })
  @ApiOkResponse({ description: 'Affectation mise à jour.' })
  @Roles('admin', 'superadmin')
  assign(@Param('eventId') eventId: string, @Param('id') id: string, @Body() dto: AssignDto) {
    return this.svc.assignRole(eventId, id, dto);
  }

  @Patch('bulk-assign')
  @ApiOperation({ summary: 'Remplacer toutes les affectations (bulk)', operationId: 'participationsBulkAssign' })
  @ApiParam({ name: 'eventId', description: "Identifiant de l'événement" })
  @ApiBody({ type: BulkAssignDto })
  @ApiOkResponse({ description: 'Affectations remplacées.' })
  @Roles('admin', 'superadmin')
  bulk(@Param('eventId') eventId: string, @Body() dto: BulkAssignDto) {
    return this.svc.bulkReplaceAssignments(eventId, dto);
  }

  @Get('kpis')
  @ApiOperation({ summary: 'KPI participations', operationId: 'participationsKpis' })
  @ApiParam({ name: 'eventId', description: "Identifiant de l'événement" })
  @ApiOkResponse({ description: 'KPIs retournés.' })
  @Roles('admin', 'superadmin')
  kpis(@Param('eventId') eventId: string) {
    return this.svc.kpis(eventId);
  }

  @Patch('confirm-all')
  @ApiOperation({ summary: 'Confirmer toutes les affectations provisoires', operationId: 'participationsConfirmAll' })
  @ApiParam({ name: 'eventId', description: "Identifiant de l'événement" })
  @ApiOkResponse({ description: 'Affectations confirmées.' })
  @Roles('admin', 'superadmin')
  confirmAll(@Param('eventId') eventId: string) {
    return this.svc.confirmAll(eventId);
  }

  @Get()
  @ApiOperation({ summary: "Lister les participations d'un événement", operationId: 'participationsFindByEvent' })
  @ApiParam({ name: 'eventId', description: "Identifiant de l'événement" })
  @ApiOkResponse({ description: "Participations de l'événement." })
  @Roles('serveur', 'admin', 'superadmin')
  findByEvent(@Param('eventId') eventId: string) {
    return this.svc.findByEvent(eventId);
  }

  @Public()
  @Get('serveur/:serveurId')
  @ApiOperation({ summary: "Lister les participations d'un serveur", operationId: 'participationsFindByServeur' })
  @ApiParam({ name: 'serveurId', description: 'Identifiant du serveur' })
  @ApiOkResponse({ description: 'Participations du serveur retournées.' })
  findByServeur(@Param('serveurId') serveurId: string) {
    return this.svc.findByServeur(serveurId);
  }
}
