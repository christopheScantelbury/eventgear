import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ChecklistItemStatus } from '@prisma/client';

export class UpdateChecklistItemDto {
  @ApiPropertyOptional({ enum: ChecklistItemStatus })
  @IsOptional()
  @IsEnum(ChecklistItemStatus)
  status?: ChecklistItemStatus;

  @ApiPropertyOptional({ example: 'Cabo com defeito visual' })
  @IsOptional()
  @IsString()
  notes?: string;
}
