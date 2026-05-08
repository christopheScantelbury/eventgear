import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar usuario na empresa (somente ADMIN)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateUserDto) {
    return this.users.create(user.companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios da empresa (somente ADMIN)' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.users.findAll(user.companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover usuario da empresa (somente ADMIN)' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.users.remove(user.companyId, user.id, id);
  }
}
