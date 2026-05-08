import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateMaterialDto {
  @ApiProperty({ example: 'Caixa de Som JBL 15"' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'Áudio' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  category: string;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  totalQty: number;

  @ApiPropertyOptional({ example: 'Caixa ativa com bluetooth' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'SN-001-2024' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({ example: 'JBL' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'EON615' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 3500.0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  replaceCost?: number;
}
