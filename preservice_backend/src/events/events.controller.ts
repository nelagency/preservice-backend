import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBody,
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
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({
    summary: "Creation d'un evenement",
    description: 'Cree un nouvel evenement (type, date, lieu, etc.).',
    operationId: 'eventsCreate',
  })
  @ApiBody({
    type: CreateEventDto,
    examples: {
      default: {
        value: {
          title: 'Mariage Ali & Ines',
          description: 'description',
          location: 'Salle des Fetes - Sfax',
          startdate: '2025-12-20T17:00:00.000Z',
          enddate: '2025-12-20T17:00:00.000Z',
          type: 'Mariages',
          serveurs: [],
          nbServeur: 18,
          guests: 180,
          status: 'En attente',
          amount: 4500,
          etat: 'Urgent',
        },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Evenement cree.' })
  @Roles('admin', 'superadmin')
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Liste des evenements',
    description:
      'Retourne tous les evenements (sans pagination), tries par date decroissante.',
    operationId: 'eventsFindAll',
  })
  @ApiOkResponse({ description: 'Liste de tous les evenements.' })
  findAll() {
    return this.eventsService.findAll();
  }

  @Patch(':id')
  @ApiOperation({
    summary: "Mise a jour d'un evenement",
    description: "Met a jour les champs d'un evenement existant.",
    operationId: 'eventsUpdate',
  })
  @ApiBody({
    type: UpdateEventDto,
    examples: {
      statusOnly: { value: { status: 'confirme' } },
      full: {
        value: {
          title: 'Mariage Ali & Ines (MAJ)',
          location: 'Sousse',
          date: '2025-12-21T18:00:00.000Z',
          type: 'Buffets',
          guests: 200,
          amount: 5200,
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Evenement mis a jour.' })
  @Roles('admin', 'superadmin')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: "Suppression d'un evenement",
    description: 'Supprime un evenement par identifiant.',
    operationId: 'eventsDelete',
  })
  @ApiOkResponse({ description: 'Evenement supprime.' })
  @Roles('admin', 'superadmin')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Get('analytics/kpi')
  @ApiOperation({
    summary: 'KPI evenements (mois vs mois precedent)',
    description:
      'Retourne 4 KPI (evenements, serveurs actifs, demandes en attente, revenus).',
    operationId: 'eventsKpi',
  })
  @ApiOkResponse({ description: 'KPI du mois courant vs mois precedent.' })
  @Roles('admin', 'superadmin')
  kpi() {
    return this.eventsService.kpi();
  }

  @Get('analytics/recent')
  @ApiOperation({
    summary: 'Evenements ajoutes recemment',
    description: 'Retourne les 4 derniers evenements crees.',
    operationId: 'eventsRecent',
  })
  @ApiOkResponse({ description: '4 evenements ajoutes recemment.' })
  @Roles('admin', 'superadmin')
  recent() {
    return this.eventsService.recent();
  }

  @Get('analytics/types/percent')
  @ApiOperation({
    summary: 'Repartition par type',
    description:
      'Retourne le nombre et le pourcentage des evenements par type.',
    operationId: 'eventsTypesPercent',
  })
  @ApiOkResponse({ description: 'Repartition par type (percent + count).' })
  @Roles('admin', 'superadmin')
  typesPercent() {
    return this.eventsService.typesPercent();
  }

  @Public()
  @Get('meta/types')
  @ApiOperation({
    summary: "Types d'evenement",
    description: "Retourne l'enumeration des types { key, value }.",
    operationId: 'eventsTypesMeta',
  })
  @ApiOkResponse({ description: 'Enum des types (key/value).' })
  typesKV() {
    return this.eventsService.typesKV();
  }

  @Public()
  @Get('meta/statuses')
  @ApiOperation({
    summary: "Statuts d'evenement",
    description: "Retourne l'enumeration des statuts { key, value }.",
    operationId: 'eventsStatusesMeta',
  })
  @ApiOkResponse({ description: 'Enum des statuts (key/value).' })
  statusesKV() {
    return this.eventsService.statusesKV();
  }

  // Keep this dynamic route at the end of GET routes to avoid
  // intercepting /analytics/* and /meta/* paths.
  @Public()
  @Get(':id')
  @ApiOperation({
    summary: "Detail d'un evenement",
    description: 'Retourne un evenement par identifiant.',
    operationId: 'eventsFindOne',
  })
  @ApiOkResponse({ description: "Detail de l'evenement." })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }
}
