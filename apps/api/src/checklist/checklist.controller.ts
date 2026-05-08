import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ChecklistService } from './checklist.service';
import { GenerateChecklistDto } from './dto/generate-checklist.dto';
import { ScanQrDto } from './dto/scan-qr.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';

@ApiTags('checklist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  @Post('events/:eventId/checklist/generate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Gerar checklist de saída ou retorno para o evento' })
  @ApiCreatedResponse()
  generate(
    @CurrentUser() user: AuthUser,
    @Param('eventId') eventId: string,
    @Body() dto: GenerateChecklistDto,
  ) {
    return this.checklistService.generate(user.companyId, eventId, dto);
  }

  @Get('events/:eventId/checklist')
  @ApiOperation({ summary: 'Listar checklist do evento com resumo de status' })
  @ApiOkResponse()
  findByEvent(@CurrentUser() user: AuthUser, @Param('eventId') eventId: string) {
    return this.checklistService.findByEvent(user.companyId, eventId);
  }

  @Post('checklist/scan')
  @ApiOperation({ summary: 'Confirmar item via scan de QR Code' })
  @ApiCreatedResponse()
  scan(@CurrentUser() user: AuthUser, @Body() dto: ScanQrDto) {
    return this.checklistService.scan(user.companyId, user.id, dto);
  }

  @Patch('events/:eventId/checklist/:itemId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar item do checklist manualmente' })
  @ApiOkResponse()
  updateItem(
    @CurrentUser() user: AuthUser,
    @Param('eventId') eventId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateChecklistItemDto,
  ) {
    return this.checklistService.updateItem(user.companyId, eventId, itemId, dto);
  }
}
