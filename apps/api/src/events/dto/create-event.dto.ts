import { IsString, IsDateString, IsOptional, MinLength, MaxLength, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Festival de Verão 2026' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: '2026-06-15T08:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-06-16T22:00:00.000Z' })
  @IsDateString()
  returnDate: string;

  @ApiPropertyOptional({ example: 'Parque da Cidade, São Paulo' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({ description: 'ID do Customer (preferido) — preenche automaticamente client' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ example: 'Prefeitura Municipal', description: 'Nome livre — usado quando não há customerId' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  client?: string;

  @ApiPropertyOptional({ example: 'Trazer cabos extras' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 5000.00 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalAmount?: number;

  @ApiPropertyOptional({ example: 200.00 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discount?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  paid?: boolean;
}
