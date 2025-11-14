import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UsePipes } from '@nestjs/common';
import {
  ApiBearerAuth, ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiBody
} from '@nestjs/swagger';
import { ServeurService } from './serveur.service';
import { CreateServeurDto } from './dto/create-serveur.dto';
import { UpdateServeurDto } from './dto/update-serveur.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Serveurs')
@ApiBearerAuth()
@Controller('serveur')
export class ServeurController {
  constructor(private readonly serveurService: ServeurService) { }

  @Post()
  @ApiOperation({
    summary: "Création d'un serveur",
    description: "Ajoute un nouveau serveur (personnel).",
    operationId: 'serveursCreate',
  })
  @ApiBody({
    type: CreateServeurDto,
    examples: {
      default: {
        value: {
          nom: 'Talom',
          prenom: 'Odilon',
          phone: '+21620000000',
          email: 'odilontalom@gmail.com',
          mot_passe: 'Passw0rd!',
          years: 3,
          skills: ['service de table', 'bar'],
          status: 'disponible',
          isActive: true
        }
      }
    }
  })
  @ApiCreatedResponse({ description: "Serveur créé." })
  @Roles('admin', 'superadmin')
  create(@Body() createServeurDto: CreateServeurDto) {
    return this.serveurService.create(createServeurDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Liste des serveurs',
    description: 'Retourne tous les serveurs (sans pagination).',
    operationId: 'serveursFindAll',
  })
  @ApiOkResponse({ description: 'Liste de tous les serveurs.' })
  @Roles('admin', 'superadmin')
  findAll() {
    return this.serveurService.findAll();
  }

  @Public()
  @Get('meta/serveur-statuses')
  @ApiOperation({
    summary: 'Statuts de serveur',
    description: "Retourne l'énumération des statuts de serveur sous forme { key, value }.",
    operationId: 'serveursStatusesMeta',
  })
  @ApiOkResponse({ description: 'Énum des statuts de serveur (key/value).' })
  @Roles('admin', 'superadmin')
  serveurStatusesKV() {
    return this.serveurService.serveurStatusesKV();
  }

  @Get(':id')
  @ApiOperation({
    summary: "Détail d'un serveur",
    description: 'Retourne un serveur par identifiant.',
    operationId: 'serveursFindOne',
  })
  @ApiOkResponse({ description: 'Détail du serveur.' })
  @Roles('admin', 'superadmin')
  findOne(@Param('id') id: string) {
    return this.serveurService.findOne(id);
  }

  @Get(':id/assigned-events')
  @ApiOperation({
    summary: "L'ensemble des evenements assignés d'un serveur",
    operationId: 'listAssignedEvents',
  })
  @ApiOkResponse({ description: 'Events assigns du serveur.' })
  @Roles('admin', 'superadmin', 'serveur')
  async listAssignedEvents(@Param('id') id: string) {
    return this.serveurService.listAssignedEvents(id);
  }

  @Patch(':id/password')
  @UsePipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: false,
    validationError: { target: false, value: false },
  }))
  @ApiOperation({
    summary: "Changer le password d'un serveur",
    operationId: 'changePassword',
  })
  @ApiOkResponse({ description: 'Mot de passe du serveur mis à jour.' })
  @Roles('admin', 'superadmin', 'serveur')
  async changePassword(@Param('id') id: string, @Body() body: ChangePasswordDto) {
    return this.serveurService.changePassword(id, body);
  }

  @Patch(':id')
  @ApiOperation({
    summary: "Mise à jour d'un serveur",
    description: "Met à jour les informations d'un serveur.",
    operationId: 'serveursUpdate',
  })
  @ApiBody({
    type: UpdateServeurDto,
    examples: {
      default: {
        value: {
          phone: '+21620000111',
          years: 4,
          email: 'karim.salah+new@gmail.com.com',
          mot_passe: 'NewPassw0rd!',
          skills: ['service de table', 'bar', 'caisse'],
          status: 'occupe',
          isActive: true
        }
      }
    }
  })
  @ApiOkResponse({ description: 'Serveur mis à jour.' })
  @Roles('admin', 'superadmin')
  update(@Param('id') id: string, @Body() updateServeurDto: UpdateServeurDto) {
    return this.serveurService.update(id, updateServeurDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: "Suppression d'un serveur",
    description: 'Supprime un serveur par identifiant.',
    operationId: 'serveursDelete',
  })
  @ApiOkResponse({ description: 'Serveur supprimé.' })
  @Roles('admin', 'superadmin')
  remove(@Param('id') id: string) {
    return this.serveurService.remove(id);
  }
}