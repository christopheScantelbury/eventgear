import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AddMaterialDto } from './dto/add-material.dto';
import { UpdateAllocationDto } from './dto/update-allocation.dto';
import { ListEventsDto } from './dto/list-events.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';

@ApiTags('events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar evento' })
  @ApiCreatedResponse()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateEventDto) {
    return this.eventsService.create(user.companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar eventos' })
  @ApiOkResponse()
  findAll(@CurrentUser() user: AuthUser, @Query() query: ListEventsDto) {
    return this.eventsService.findAll(user.companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar evento com materiais e checklist' })
  @ApiOkResponse()
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.eventsService.findOne(user.companyId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar evento' })
  @ApiOkResponse()
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(user.companyId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar evento' })
  @ApiOkResponse()
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.eventsService.remove(user.companyId, id);
  }

  // ── Alocação de materiais ──────────────────────────────────────

  @Post(':id/materials')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Adicionar material ao evento' })
  @ApiCreatedResponse()
  addMaterial(
    @CurrentUser() user: AuthUser,
    @Param('id') eventId: string,
    @Body() dto: AddMaterialDto,
  ) {
    return this.eventsService.addMaterial(user.companyId, eventId, dto);
  }

  @Patch(':id/materials/:materialId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar quantidade alocada' })
  @ApiOkResponse()
  updateAllocation(
    @CurrentUser() user: AuthUser,
    @Param('id') eventId: string,
    @Param('materialId') materialId: string,
    @Body() dto: UpdateAllocationDto,
  ) {
    return this.eventsService.updateAllocation(user.companyId, eventId, materialId, dto);
  }

  @Delete(':id/materials/:materialId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover material do evento' })
  @ApiNoContentResponse()
  removeMaterial(
    @CurrentUser() user: AuthUser,
    @Param('id') eventId: string,
    @Param('materialId') materialId: string,
  ) {
    return this.eventsService.removeMaterial(user.companyId, eventId, materialId);
  }
}
