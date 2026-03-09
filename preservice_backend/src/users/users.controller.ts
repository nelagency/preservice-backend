import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import {
  ApiBearerAuth, ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse,
  ApiUnauthorizedResponse, ApiBody
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: "Création d'un utilisateur",
    description: "Crée un nouvel utilisateur (rôle par défaut: user).",
    operationId: 'usersCreate',
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      default: {
        value: {
          nom: 'Nadia Test',
          email: 'nadia@example.com',
          numero_tel: '+21620000099',
          adresse: 'Tunis',
          mot_passe: 'Passw0rd!',
          role: 'admin'
        }
      }
    }
  })
  @ApiCreatedResponse({ description: 'Utilisateur créé.' })
  @ApiUnauthorizedResponse({ description: 'Non autorisé.' }) 
  @Roles('admin', 'superadmin')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Liste des utilisateurs',
    description: 'Retourne tous les utilisateurs (sans pagination).',
    operationId: 'usersFindAll',
  })
  @ApiOkResponse({ description: 'Liste des utilisateurs.' })
  @ApiUnauthorizedResponse({ description: 'Non autorisé.' })
  @Roles('admin', 'superadmin')
  findAll() {
    return this.usersService.findAll();
  }

  // NOTE: placer la route statique avant ":id"
  @Public()
  @Get('meta/roles')
  @ApiOperation({
    summary: 'Rôles disponibles',
    description: 'Retourne la liste des rôles ({ key, value }).',
    operationId: 'usersRolesMeta',
  })
  @ApiOkResponse({ description: 'Rôles disponibles.' })
  rolesKV() { return this.usersService.rolesKV(); }

  @Get(':id')
  @ApiOperation({
    summary: "Détail d'un utilisateur",
    description: "Retourne l'utilisateur par identifiant.",
    operationId: 'usersFindOne',
  })
  @ApiOkResponse({ description: 'Utilisateur trouvé.' })
  @Roles('admin', 'superadmin')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: "Mise à jour d'un utilisateur",
    description: "Met à jour les informations d'un utilisateur.",
    operationId: 'usersUpdate',
  })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      default: {
        value: {
          nom: 'Nadia Test (MAJ)',
          adresse: 'Sfax',
          role: 'superadmin',
          isActive: true
        }
      }
    }
  })
  @ApiOkResponse({ description: 'Utilisateur mis à jour.' })
  @Roles('admin', 'superadmin')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: "Suppression d'un utilisateur",
    description: 'Supprime un utilisateur par identifiant.',
    operationId: 'usersDelete',
  })
  @ApiOkResponse({ description: 'Utilisateur supprimé.' })
  @Roles('admin', 'superadmin')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
