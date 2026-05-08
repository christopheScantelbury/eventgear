import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ListCustomersDto } from './dto/list-customers.dto';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private customers: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar cliente' })
  create(@CurrentUser() u: AuthUser, @Body() dto: CreateCustomerDto) {
    return this.customers.create(u.companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes (paginado, busca)' })
  list(@CurrentUser() u: AuthUser, @Query() dto: ListCustomersDto) {
    return this.customers.list(u.companyId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do cliente + histórico de eventos' })
  get(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.customers.get(u.companyId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  update(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customers.update(u.companyId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover cliente (soft delete)' })
  remove(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.customers.remove(u.companyId, id);
  }
}
