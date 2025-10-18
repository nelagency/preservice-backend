import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import {
  ApiBearerAuth, ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiBody
} from '@nestjs/swagger';
import { DemandesService } from './demandes.service';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { UpdateDemandeDto } from './dto/update-demande.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Demandes')
@ApiBearerAuth()
@Controller('demandes')
export class DemandesController {
  constructor(private readonly demandesService: DemandesService) {}

  @Public()
  @Post()
  @ApiOperation({
    summary: "Création d'une demande",
    description: "Crée une nouvelle demande d'événement par un client.",
    operationId: 'demandesCreate',
  })
  @ApiBody({
    type: CreateDemandeDto,
    examples: {
      default: {
        value: {
          client: "665400000000000000000001",
          type: "Mariages",
          date_proposee: "2025-12-20T17:00:00.000Z",
          nb_serveurs: 5,
          status: "en_attente"
        }
      }
    }
  })
  @ApiCreatedResponse({ description: 'Demande créée.' })
  create(@Body() createDemandeDto: CreateDemandeDto) {
    return this.demandesService.create(createDemandeDto);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Liste des demandes',
    description: 'Retourne toutes les demandes (sans pagination).',
    operationId: 'demandesFindAll',
  })
  @ApiOkResponse({ description: 'Toutes les demandes.' })
  findAll() {
    return this.demandesService.findAll();
  }

  @Public()
  @Get('meta/types')
  @ApiOperation({
    summary: 'Types de demande',
    description: 'Retourne les types possibles de demande sous forme { key, value }.',
    operationId: 'demandesTypesMeta',
  })
  @ApiOkResponse({ description: 'Types de demande (clé/valeur).' })
  typesKV() { return this.demandesService.typesKV(); }

  @Public()
  @Get('meta/types')
  @ApiOperation({
    summary: 'Statuts de demande',
    description: 'Retourne les statuts possibles de demande sous forme { key, value }.',
    operationId: 'demandesStatutMeta',
  })
  @ApiOkResponse({ description: 'Types de demande (clé/valeur).' })
  statusesKV() { return this.demandesService.statusesKV(); }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: "Détail d'une demande",
    description: "Retourne une demande par identifiant.",
    operationId: 'demandesFindOne',
  })
  @ApiOkResponse({ description: 'Détail de la demande.' })
  findOne(@Param('id') id: string) {
    return this.demandesService.findOne(id);
  }

  @Public()
  @Patch(':id')
  @ApiOperation({
    summary: "Mise à jour d'une demande",
    description: "Met à jour les champs d'une demande existante.",
    operationId: 'demandesUpdate',
  })
  @ApiBody({
    type: UpdateDemandeDto,
    examples: {
      statusOnly: { value: { status: "confirme" } },
      full: {
        value: {
          type: "Buffets",
          date_proposee: "2025-12-22T19:00:00.000Z",
          nb_serveurs: 7,
          status: "en_attente"
        }
      }
    }
  })
  @ApiOkResponse({ description: 'Demande mise à jour.' })
  update(@Param('id') id: string, @Body() updateDemandeDto: UpdateDemandeDto) {
    return this.demandesService.update(id, updateDemandeDto);
  }

  @Public()
  @Delete(':id')
  @ApiOperation({
    summary: "Suppression d'une demande",
    description: 'Supprime une demande par identifiant.',
    operationId: 'demandesDelete',
  })
  @ApiOkResponse({ description: 'Demande supprimée.' })
  remove(@Param('id') id: string) {
    return this.demandesService.remove(id);
  }
}