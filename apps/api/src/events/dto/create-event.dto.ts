import { IsString, IsDateString, IsOptional, MinLength, MaxLength } from 'class-validator';
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

  @ApiPropertyOptional({ example: 'Prefeitura Municipal' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  client?: string;

  @ApiPropertyOptional({ example: 'Trazer cabos extras' })
  @IsOptional()
  @IsString()
  notes?: string;
}
