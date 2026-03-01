import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InstagramService } from './instagram.service';
import { CreateInstagramPostDto } from './dto/create-instagram-post.dto';
import { UpdateInstagramPostDto } from './dto/update-instagram-post.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Instagram')
@ApiBearerAuth()
@Controller('instagram-posts')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Liste des posts Instagram',
    description: 'Retourne les posts Instagram actifs pour affichage frontend.',
    operationId: 'instagramFindAll',
  })
  @ApiOkResponse({ description: 'Liste des posts Instagram.' })
  findAll() {
    return this.instagramService.findAll();
  }

  @Post()
  @Roles('admin', 'superadmin')
  @ApiOperation({
    summary: 'Ajouter un post Instagram',
    description: 'Ajout manuel d un post Instagram (image, texte, date, lien).',
    operationId: 'instagramCreate',
  })
  @ApiBody({ type: CreateInstagramPostDto })
  create(@Body() dto: CreateInstagramPostDto) {
    return this.instagramService.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'superadmin')
  @ApiOperation({
    summary: 'Modifier un post Instagram',
    description: 'Met a jour un post Instagram local existant.',
    operationId: 'instagramUpdate',
  })
  @ApiBody({ type: UpdateInstagramPostDto })
  update(@Param('id') id: string, @Body() dto: UpdateInstagramPostDto) {
    return this.instagramService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'superadmin')
  @ApiOperation({
    summary: 'Supprimer un post Instagram',
    description: 'Supprime un post Instagram local.',
    operationId: 'instagramDelete',
  })
  remove(@Param('id') id: string) {
    return this.instagramService.remove(id);
  }
}
