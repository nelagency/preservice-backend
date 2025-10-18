// src/stats/stats.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Stats')
@Controller('stats')
export class StatsController {
    constructor(private readonly svc: StatsService) { }

    @Public()
    @Get('overview')
    @ApiOperation({ summary: 'Tableau de bord (agrégats globaux)' })
    @ApiOkResponse({ description: 'KPIs + séries' })
    overview() { return this.svc.overview(); }
}