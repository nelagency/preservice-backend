import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import {
  ApiBearerAuth, ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse,
  ApiBody
} from '@nestjs/swagger';
import { AvisService } from './avis.service';
import { CreateAviDto } from './dto/create-avi.dto';
import { UpdateAviDto } from './dto/update-avi.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Avis')
@ApiBearerAuth()
@Controller('avis')
export class AvisController {
  constructor(private readonly avisService: AvisService) {}

  @Public()
  @Post()
  @ApiOperation({
    summary: "Création d'un avis",
    description: "Crée un nouvel avis pour un événement par un client.",
    operationId: 'avisCreate',
  })
  @ApiBody({
    type: CreateAviDto,
    examples: {
      default: {
        value: {
          note: 5,
          commentaire: "Parfait, service impeccable.",
          client: "6653fe1c2b8a0c0f5e2c1a11",
          event:  "6653ff7a2b8a0c0f5e2c1a22",
          etat: true
        }
      }
    }
  })
  @ApiCreatedResponse({ description: 'Avis créé.' })
  //@Roles('admin', 'superadmin')
  create(@Body() createAviDto: CreateAviDto) {
    return this.avisService.create(createAviDto);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Liste des avis',
    description: 'Retourne tous les avis (sans pagination).',
    operationId: 'avisFindAll',
  })
  @ApiOkResponse({ description: 'Tous les avis.' })
  findAll() {
    return this.avisService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: "Détail d'un avis",
    description: "Retourne un avis par identifiant.",
    operationId: 'avisFindOne',
  })
  @ApiOkResponse({ description: 'Détail de l’avis.' })
  @Roles('admin', 'superadmin')
  findOne(@Param('id') id: string) {
    return this.avisService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: "Mise à jour d'un avis",
    description: "Met à jour un avis existant.",
    operationId: 'avisUpdate',
  })
  @ApiBody({
    type: UpdateAviDto,
    examples: {
      default: {
        value: {
          note: 4,
          commentaire: "Très bien, quelques retards.",
          etat: true
        }
      }
    }
  })
  @ApiOkResponse({ description: 'Avis mis à jour.' })
  @Roles('admin', 'superadmin')
  update(@Param('id') id: string, @Body() updateAviDto: UpdateAviDto) {
    return this.avisService.update(id, updateAviDto);
  }


  @Delete(':id')
  @ApiOperation({
    summary: "Suppression d'un avis",
    description: 'Supprime un avis par identifiant.',
    operationId: 'avisDelete',
  })
  @ApiOkResponse({ description: 'Avis supprimé.' })
  @Roles('admin', 'superadmin')
  remove(@Param('id') id: string) {
    return this.avisService.remove(id);
  }
}