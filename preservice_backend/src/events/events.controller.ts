import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import {
  ApiBearerAuth, ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiBody
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Post()
  @ApiOperation({
    summary: "Création d'un événement",
    description: "Crée un nouvel événement (type, date, lieu, etc.).",
    operationId: 'eventsCreate',
  })
  @ApiBody({
    type: CreateEventDto, 
    examples: {
      default: {
        value: {
          title: "Mariage Ali & Ines",
          description: "description",
          location: "Salle des Fêtes - Sfax",
          startdate: "2025-12-20T17:00:00.000Z",
          enddate: "2025-12-20T17:00:00.000Z",
          type: "Mariages",
          serveurs: [],
          nbServeur: 18,
          guests: 180,
          status: "En attente",
          amount: 4500,
          etat: "Urgent"
        }
      }
    }
  })
  @ApiCreatedResponse({ description: 'Événement créé.' })
  @Roles('admin', 'superadmin')
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Liste des événements',
    description: 'Retourne tous les événements (sans pagination), triés par date décroissante.',
    operationId: 'eventsFindAll',
  })
  @ApiOkResponse({ description: 'Liste de tous les événements.' })
  findAll() {
    return this.eventsService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: "Détail d'un événement",
    description: "Retourne un événement par identifiant.",
    operationId: 'eventsFindOne',
  })
  @ApiOkResponse({ description: 'Détail de l’événement.' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: "Mise à jour d'un événement",
    description: "Met à jour les champs d’un événement existant.",
    operationId: 'eventsUpdate',
  })
  @ApiBody({
    type: UpdateEventDto,
    examples: {
      statusOnly: { value: { status: "confirme" } },
      full: {
        value: {
          title: "Mariage Ali & Ines (MAJ)",
          location: "Sousse",
          date: "2025-12-21T18:00:00.000Z",
          type: "Buffets",
          guests: 200,
          amount: 5200
        }
      }
    }
  })
  @ApiOkResponse({ description: 'Événement mis à jour.' })
  @Roles('admin', 'superadmin')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: "Suppression d'un événement",
    description: 'Supprime un événement par identifiant.',
    operationId: 'eventsDelete',
  })
  @ApiOkResponse({ description: 'Événement supprimé.' })
  @Roles('admin', 'superadmin')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  // ---------- Analytics ----------
  @Get('analytics/kpi')
  @ApiOperation({
    summary: 'KPI événements (mois vs mois précédent)',
    description: 'Retourne 4 KPI (événements, serveurs actifs, demandes en attente, revenus).',
    operationId: 'eventsKpi',
  })
  @ApiOkResponse({ description: 'KPI du mois courant vs mois précédent.' })
  @Roles('admin', 'superadmin')
  kpi() { return this.eventsService.kpi(); }

  @Get('analytics/recent')
  @ApiOperation({
    summary: 'Événements ajoutés récemment',
    description: 'Retourne les 4 derniers événements créés.',
    operationId: 'eventsRecent',
  })
  @ApiOkResponse({ description: '4 événements ajoutés récemment.' })
  @Roles('admin', 'superadmin')
  recent() { return this.eventsService.recent(); }

  @Get('analytics/types/percent')
  @ApiOperation({
    summary: 'Répartition par type',
    description: 'Retourne le nombre et le pourcentage des événements par type.',
    operationId: 'eventsTypesPercent',
  })
  @ApiOkResponse({ description: 'Répartition par type (percent + count).' })
  @Roles('admin', 'superadmin')
  typesPercent() { return this.eventsService.typesPercent(); }

  // ---------- Meta ----------
  @Public()
  @Get('meta/types')
  @ApiOperation({
    summary: "Types d'événement",
    description: "Retourne l'énumération des types { key, value }.",
    operationId: 'eventsTypesMeta',
  })
  @ApiOkResponse({ description: 'Énum des types (key/value).' })
  typesKV() { return this.eventsService.typesKV(); }

  @Public()
  @Get('meta/statuses')
  @ApiOperation({
    summary: "Statuts d'événement",
    description: "Retourne l'énumération des statuts { key, value }.",
    operationId: 'eventsStatusesMeta',
  })
  @ApiOkResponse({ description: 'Énum des statuts (key/value).' })
  statusesKV() { return this.eventsService.statusesKV(); }
}