import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMaterialDto {
  @ApiProperty({ example: 'clxyz123' })
  @IsString()
  materialId: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  qtyAllocated: number;
}
