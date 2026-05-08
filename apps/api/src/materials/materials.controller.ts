import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { ListMaterialsDto } from './dto/list-materials.dto';

@ApiTags('materials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('materials')
export class MaterialsController {
  constructor(private materials: MaterialsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar material (somente ADMIN)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateMaterialDto) {
    return this.materials.create(user.companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar materiais' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: ListMaterialsDto) {
    return this.materials.findAll(user.companyId, query);
  }

  @Get('qr/:code')
  @ApiOperation({ summary: 'Buscar material por QR code' })
  findByQr(@CurrentUser() user: AuthUser, @Param('code') code: string) {
    return this.materials.findByQrCode(user.companyId, code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar material por ID' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.materials.findOne(user.companyId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar material (somente ADMIN)' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateMaterialDto,
  ) {
    return this.materials.update(user.companyId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover material (somente ADMIN)' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.materials.remove(user.companyId, id);
  }

  @Post(':id/photos')
  @Roles(UserRole.ADMIN)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Adicionar foto ao material (somente ADMIN)' })
  async addPhoto(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Req() req: FastifyRequest,
  ) {
    const data = await (req as any).file();
    if (!data) throw new BadRequestException('No file uploaded');

    const MAX_BYTES = 5 * 1024 * 1024;
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of data.file) {
      size += chunk.length;
      if (size > MAX_BYTES) throw new BadRequestException('File exceeds 5 MB limit');
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const isPrimary = data.fields?.isPrimary?.value === 'true';

    return this.materials.addPhoto(user.companyId, id, buffer, data.filename, data.mimetype, isPrimary);
  }

  @Delete(':id/photos/:photoId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover foto do material (somente ADMIN)' })
  removePhoto(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('photoId') photoId: string,
  ) {
    return this.materials.removePhoto(user.companyId, id, photoId);
  }
}
