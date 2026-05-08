import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChecklistType } from '@prisma/client';

export class GenerateChecklistDto {
  @ApiProperty({ enum: ChecklistType, example: 'DEPARTURE' })
  @IsEnum(ChecklistType)
  type: ChecklistType;
}
