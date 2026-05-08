import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Resumo geral: materiais e eventos da empresa' })
  @ApiOkResponse()
  dashboard(@CurrentUser() user: AuthUser) {
    return this.reportsService.dashboard(user.companyId);
  }

  @Get('events/:eventId')
  @ApiOperation({ summary: 'Relatório detalhado de um evento' })
  @ApiOkResponse()
  eventReport(@CurrentUser() user: AuthUser, @Param('eventId') eventId: string) {
    return this.reportsService.eventReport(user.companyId, eventId);
  }

  @Get('materials/:materialId/usage')
  @ApiOperation({ summary: 'Histórico de uso de um material' })
  @ApiOkResponse()
  materialUsage(@CurrentUser() user: AuthUser, @Param('materialId') materialId: string) {
    return this.reportsService.materialUsage(user.companyId, materialId);
  }
}
