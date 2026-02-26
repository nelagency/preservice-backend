import { Controller, Get, HttpCode, HttpStatus, Query, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiExcludeController } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { runCronMaintenance } from './scripts/cron-maintenance';

@ApiExcludeController() // Masque tout le contrôleur dans Swagger
@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Public()
  @Get('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Test de connectivité',
    description: 'Retourne un message simple pour vérifier que l’API répond.',
    operationId: 'systemTest',
  })
  @ApiOkResponse({ description: 'Réponse OK.' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Vérification de santé',
    description: 'Retourne { ok: true, ts } pour indiquer que le service est en ligne.',
    operationId: 'systemHealth',
  })
  @ApiOkResponse({ description: 'Service en ligne.' })
  health() {
    return { ok: true, ts: Date.now() };
  }

  @Public()
  @Get('cron/maintenance')
  @HttpCode(HttpStatus.OK)
  async cronMaintenance(@Query('key') key?: string) {
    const expectedKey = process.env.CRON_SECRET;
    if (!expectedKey || key !== expectedKey) {
      throw new UnauthorizedException('Invalid cron key');
    }
    return runCronMaintenance();
  }
}
