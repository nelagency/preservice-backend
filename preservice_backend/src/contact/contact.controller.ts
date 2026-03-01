import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { UpdateContactMessageStatusDto } from './dto/update-contact-message-status.dto';

@ApiTags('Contact')
@ApiBearerAuth()
@Controller('contact/messages')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Post()
  @ApiOperation({
    summary: 'Envoyer un message de contact',
    description: 'Endpoint public du formulaire de contact.',
    operationId: 'contactCreateMessage',
  })
  @ApiBody({ type: CreateContactMessageDto })
  @ApiOkResponse({ description: 'Message enregistré.' })
  create(@Body() dto: CreateContactMessageDto) {
    return this.contactService.create(dto);
  }

  @Get()
  @Roles('admin', 'superadmin')
  @ApiOperation({
    summary: 'Lister les messages de contact',
    description: 'Permet au dashboard admin de récupérer les messages reçus.',
    operationId: 'contactFindAllMessages',
  })
  @ApiOkResponse({ description: 'Liste des messages.' })
  findAll() {
    return this.contactService.findAll();
  }

  @Patch(':id/status')
  @Roles('admin', 'superadmin')
  @ApiOperation({
    summary: 'Marquer un message comme traité',
    description: 'Met à jour le statut du message (pending/processed).',
    operationId: 'contactUpdateMessageStatus',
  })
  @ApiBody({ type: UpdateContactMessageStatusDto })
  @ApiOkResponse({ description: 'Statut mis à jour.' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateContactMessageStatusDto) {
    return this.contactService.updateStatus(id, dto);
  }
}

