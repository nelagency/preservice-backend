import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateServiceItemDto } from './dto/create-service-item.dto';
import { UpdateServiceItemDto } from './dto/update-service-item.dto';
import { ServicesContentService } from './services-content.service';

@ApiTags('Services Content')
@ApiBearerAuth()
@Controller('services')
export class ServicesContentController {
  constructor(private readonly servicesContentService: ServicesContentService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Lister les services (public)',
    description: 'Retourne les services actifs affichés sur le site.',
    operationId: 'servicesContentFindAllPublic',
  })
  @ApiOkResponse({ description: 'Liste des services actifs.' })
  findAllPublic() {
    return this.servicesContentService.findAllPublic();
  }

  @Get('admin/all')
  @Roles('admin', 'superadmin')
  @ApiOperation({
    summary: 'Lister tous les services (admin)',
    description: 'Retourne tous les services incluant inactifs pour le dashboard.',
    operationId: 'servicesContentFindAllAdmin',
  })
  @ApiOkResponse({ description: 'Liste complète des services.' })
  findAllAdmin() {
    return this.servicesContentService.findAllAdmin();
  }

  @Post()
  @Roles('admin', 'superadmin')
  @ApiOperation({
    summary: 'Ajouter un service',
    description: 'Ajoute un service affichable sur la page Services.',
    operationId: 'servicesContentCreate',
  })
  @ApiBody({ type: CreateServiceItemDto })
  create(@Body() dto: CreateServiceItemDto) {
    return this.servicesContentService.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'superadmin')
  @ApiOperation({
    summary: 'Modifier un service',
    description: 'Met à jour un service existant.',
    operationId: 'servicesContentUpdate',
  })
  @ApiBody({ type: UpdateServiceItemDto })
  update(@Param('id') id: string, @Body() dto: UpdateServiceItemDto) {
    return this.servicesContentService.update(id, dto);
  }
}

