import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { RequestR2PresignDto, FinalizeR2UploadDto, ApproveMediaDto, CreateBeforeAfterDto, CreateStreamDirectUploadDto, FinalizeStreamUploadDto } from './dto/media.dto';
import { Roles } from 'src/common/decorators/roles.decorator'; // tes guards existants
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
    constructor(private readonly svc: MediaService) { }

    // ---- Images (R2) ----
    @Post('r2/presign')
    @ApiOperation({ summary: 'Demander une URL présignée (PUT) pour uploader une image vers R2' })
    @ApiBody({ type: RequestR2PresignDto })
    @Roles('admin', 'superadmin', 'serveur', 'coordinateur')
    presignR2(@Body() dto: RequestR2PresignDto) {
        return this.svc.requestR2Presign({ filename: dto.filename, contentType: dto.contentType, eventId: dto.eventId });
    }

    @Post('r2/finalize')
    @ApiOperation({ summary: 'Finaliser un upload R2 (créer MediaAsset public)' })
    @ApiBody({ type: FinalizeR2UploadDto })
    @Roles('admin', 'superadmin', 'serveur', 'coordinateur')
    finalizeR2(@Body() dto: FinalizeR2UploadDto) {
        return this.svc.finalizeR2Upload(dto);
    }

    // ---- Vidéos (Stream) ----
    @Post('stream/direct-upload')
    @ApiOperation({ summary: 'Obtenir une URL d’upload direct Cloudflare Stream' })
    @ApiBody({ type: CreateStreamDirectUploadDto })
    @Roles('admin', 'superadmin', 'serveur', 'coordinateur')
    streamToken() {
        return this.svc.createStreamDirectUpload();
    }

    @Post('stream/finalize')
    @ApiOperation({ summary: 'Finaliser un upload Stream (média public)' })
    @ApiBody({ type: FinalizeStreamUploadDto })
    @Roles('admin', 'superadmin', 'serveur', 'coordinateur')
    finalizeStream(@Body() dto: FinalizeStreamUploadDto) {
        return this.svc.finalizeStreamUpload(dto);
    }

    // ---- Modération & lecture ----
    @Patch(':id/approve')
    @ApiOperation({ summary: 'Approuver / révoquer un média' })
    @ApiBody({ type: ApproveMediaDto })
    @Roles('admin', 'superadmin')
    approve(@Param('id') id: string, @Body() dto: ApproveMediaDto) {
        return this.svc.approveMedia(id, dto.approved);
    }

    @Public()
    @Get('by-event/:eventId')
    @ApiOperation({ summary: 'Lister les médias d’un événement' })
    @ApiOkResponse({ description: 'Liste des MediaAsset' })
    //@Roles('admin', 'superadmin', 'serveur')
    listByEvent(@Param('eventId') eventId: string) {
        return this.svc.listByEvent(eventId);
    }

    // ---- Paires avant/après (publiques) ----
    @Public()
    @Post('before-after')
    @ApiOperation({ summary: 'Créer une paire Avant/Après (publique)' })
    @ApiBody({ type: CreateBeforeAfterDto })
    //@Roles('admin', 'superadmin', 'serveur', 'coordinateur')
    createPair(@Body() dto: CreateBeforeAfterDto) {
        return this.svc.createBeforeAfter(dto);
    }

    @Public()
    @Get('pairs/by-event/:eventId')
    @ApiOperation({ summary: 'Lister les paires Avant/Après d’un événement' })
    @ApiOkResponse({ description: 'Liste BeforeAfterPair' })
    listPairs(@Param('eventId') eventId: string) {
        return this.svc.listPairsByEvent(eventId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Supprimer un média (R2 ou Stream) et nettoyer les références' })
    @Roles('admin', 'superadmin')
    remove(@Param('id') id: string) {
        return this.svc.deleteAsset(id);
    }
}