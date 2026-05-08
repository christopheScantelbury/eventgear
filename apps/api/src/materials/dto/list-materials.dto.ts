import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { MaterialStatus } from '@prisma/client';

export class ListMaterialsDto {
  @ApiPropertyOptional({ enum: MaterialStatus })
  @IsOptional()
  @IsEnum(MaterialStatus)
  status?: MaterialStatus;

  @ApiPropertyOptional({ example: 'Áudio' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'JBL' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}
