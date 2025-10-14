import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ParticipationService } from './participation.service';
import { ApplyDto, ApproveDto, AssignDto, BulkAssignDto, CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Participations')
@ApiBearerAuth()
@Controller('events/:eventId/participations')
export class ParticipationController {
  constructor(private readonly svc: ParticipationService) { }

  // -------------------- Candidature --------------------
  @Post('apply')
  @ApiOperation({
    summary: 'Soumettre une candidature',
    description:
      "Un serveur se porte candidat pour participer à l'évènement.",
    operationId: 'participationsApply',
  })
  @ApiParam({ name: 'eventId', description: "Identifiant de l'évènement" })
  @ApiBody({
    type: ApplyDto,
    examples: {
      default: {
        value: {
          serveurId: '66f0b2a4b3cfae0012abcd34',
          notes: 'Disponible en soirée, 5 ans d’expérience.',
        },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Candidature enregistrée.' })
  @Roles('user', 'admin', 'superadmin')
  apply(@Param('eventId') eventId: string, @Body() dto: ApplyDto) {
    return this.svc.apply(eventId, dto.serveurId, dto.notes);
  }

  // -------------------- Validation candidature --------------------
  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Valider / rejeter une candidature',
    description:
      'Met à jour le statut de candidature (approved / rejected).',
    operationId: 'participationsApprove',
  })
  @ApiParam({ name: 'eventId', description: "Identifiant de l'évènement" })
  @ApiParam({ name: 'id', description: 'Identifiant de la participation' })
  @ApiBody({
    type: ApproveDto,
    examples: {
      approve: { value: { status: 'approved' } },
      reject: { value: { status: 'rejected' } },
    },
  })
  @ApiOkResponse({ description: 'Candidature mise à jour.' })
  @Roles('admin', 'superadmin')
  approve(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Body() dto: ApproveDto,
  ) {
    return this.svc.setCandidatureStatus(eventId, id, dto.status);
  }

  // -------------------- Affectation à un poste --------------------
  @Patch(':id/assign')
  @ApiOperation({
    summary: 'Assigner un serveur à un poste',
    description:
      "Assigne un rôle (poste) au serveur pour l'évènement, avec statut d'affectation (provisional/confirmed).",
    operationId: 'participationsAssign',
  })
  @ApiParam({ name: 'eventId', description: "Identifiant de l'évènement" })
  @ApiParam({ name: 'id', description: 'Identifiant de la participation' })
  @ApiBody({
    type: AssignDto,
    examples: {
      default: {
        value: {
          role: 'Serveur',
          assignmentStatus: 'provisional',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Affectation mise à jour.' })
  @Roles('admin', 'superadmin')
  assign(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Body() dto: AssignDto,
  ) {
    return this.svc.assignRole(eventId, id, dto);
  }

  // -------------------- Affectations en masse (DnD) --------------------
  @Patch('bulk-assign')
  @ApiOperation({
    summary: 'Remplacer toutes les affectations (bulk)',
    description:
      "Remplace l'ensemble des affectations d’un évènement à partir d’un mapping (id serveur → rôle). Idéal pour le drag & drop.",
    operationId: 'participationsBulkAssign',
  })
  @ApiParam({ name: 'eventId', description: "Identifiant de l'évènement" })
  @ApiBody({
    type: BulkAssignDto,
    examples: {
      default: {
        value: {
          assignments: [
            { serveurId: '66f0b2a4b3cfae0012abcd34', role: 'Coordinateur' },
            { serveurId: '66f0b2a4b3cfae0012abcd35', role: 'Serveur', assignmentStatus: 'provisional' },
            { serveurId: '66f0b2a4b3cfae0012abcd36', role: 'Hotesse' },
          ],
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Affectations remplacées.' })
  @Roles('admin', 'superadmin')
  bulk(@Param('eventId') eventId: string, @Body() dto: BulkAssignDto) {
    return this.svc.bulkReplaceAssignments(eventId, dto);
  }

  // -------------------- KPI & confirmations --------------------
  @Get('kpis')
  @ApiOperation({
    summary: 'KPI participations',
    description:
      'Retourne { confirmed, pending, unassigned, total } pour alimenter le panneau de validation.',
    operationId: 'participationsKpis',
  })
  @ApiParam({ name: 'eventId', description: "Identifiant de l'évènement" })
  @ApiOkResponse({ description: 'KPIs retournés.' })
  @Roles('admin', 'superadmin')
  kpis(@Param('eventId') eventId: string) {
    return this.svc.kpis(eventId);
  }

  @Patch('confirm-all')
  @ApiOperation({
    summary: 'Confirmer toutes les affectations provisoires',
    description:
      "Passe toutes les affectations 'provisional' à 'confirmed' pour l'évènement.",
    operationId: 'participationsConfirmAll',
  })
  @ApiParam({ name: 'eventId', description: "Identifiant de l'évènement" })
  @ApiOkResponse({ description: 'Affectations confirmées.' })
  @Roles('admin', 'superadmin')
  confirmAll(@Param('eventId') eventId: string) {
    return this.svc.confirmAll(eventId);
  }

  @Public()
  @Get(':eventId')
  @ApiOperation({
    summary: 'Lister les participations d’un évènement',
    description: 'Filtre par :eventId (pending/approved/rejected selon implémentation service).',
  })
  @ApiParam({ name: 'eventId', description: 'Identifiant de levenement' })
  @ApiOkResponse({ description: 'Evenement retourné.' })
  findByEvent(@Param('eventId') eventId: string) {
    return this.svc.findByEvent(eventId); // ⬅️ ajoute ce service
  }

  // -------------------- CRUD générique (optionnel) --------------------
  @Post()
  @ApiOperation({
    summary: 'Créer une participation (CRUD)',
    description:
      'Point d’entrée générique si besoin (utiliser plutôt /apply dans le flux standard).',
    operationId: 'participationsCreate',
  })
  @ApiBody({ type: CreateParticipationDto })
  @ApiCreatedResponse({ description: 'Participation créée.' })
  @Roles('admin', 'superadmin')
  create(@Body() createParticipationDto: CreateParticipationDto) {
    return this.svc.create(createParticipationDto);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Lister les participations (CRUD)',
    description:
      "Retourne la liste des participations (selon l'implémentation du service).",
    operationId: 'participationsFindAll',
  })
  @ApiOkResponse({ description: 'Liste des participations.' })
  findAll() {
    return this.svc.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Détail participation (CRUD)',
    description: 'Retourne une participation par identifiant.',
    operationId: 'participationsFindOne',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de la participation' })
  @ApiOkResponse({ description: 'Participation retournée.' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mise à jour participation (CRUD)',
    description: 'Met à jour une participation.',
    operationId: 'participationsUpdate',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de la participation' })
  @ApiBody({ type: UpdateParticipationDto })
  @ApiOkResponse({ description: 'Participation mise à jour.' })
  @Roles('admin', 'superadmin')
  update(@Param('id') id: string, @Body() dto: UpdateParticipationDto) {
    return this.svc.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Suppression participation (CRUD)',
    description: 'Supprime une participation.',
    operationId: 'participationsRemove',
  })
  @ApiParam({ name: 'id', description: 'Identifiant de la participation' })
  @ApiOkResponse({ description: 'Participation supprimée.' })
  @Roles('admin', 'superadmin')
  remove(@Param('id') id: string) {
    return this.svc.remove(+id);
  }
}