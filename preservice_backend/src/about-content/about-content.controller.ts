import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AboutContentService } from './about-content.service';
import { UpdateAboutContentDto } from './dto/update-about-content.dto';

@ApiTags('About Content')
@ApiBearerAuth()
@Controller('about-content')
export class AboutContentController {
  constructor(private readonly aboutContentService: AboutContentService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Récupérer le contenu de la page À propos',
    description: 'Retourne la vision, histoire, valeurs, images fondatrice et sections dynamiques.',
    operationId: 'aboutContentGet',
  })
  @ApiOkResponse({ description: 'Contenu À propos.' })
  getContent() {
    return this.aboutContentService.getContent();
  }

  @Patch()
  @Roles('admin', 'superadmin')
  @ApiOperation({
    summary: 'Modifier le contenu de la page À propos',
    description: 'Met à jour les blocs dynamiques visibles dans la page À propos.',
    operationId: 'aboutContentUpdate',
  })
  @ApiBody({ type: UpdateAboutContentDto })
  @ApiOkResponse({ description: 'Contenu À propos mis à jour.' })
  updateContent(@Body() dto: UpdateAboutContentDto) {
    return this.aboutContentService.updateContent(dto);
  }
}

