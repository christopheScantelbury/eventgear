import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { MaterialStatus } from '@prisma/client';
import { CreateMaterialDto } from './create-material.dto';

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {
  @IsOptional()
  @IsEnum(MaterialStatus)
  status?: MaterialStatus;
}
