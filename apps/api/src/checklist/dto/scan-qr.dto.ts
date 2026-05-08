import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChecklistType } from '@prisma/client';

export class ScanQrDto {
  @ApiProperty({ example: 'EG5C6EA127A923A711' })
  @IsString()
  qrCode: string;

  @ApiProperty({ example: 'cmovyeoli000113vkztfmj2w6' })
  @IsString()
  eventId: string;

  @ApiProperty({ enum: ChecklistType, example: 'DEPARTURE' })
  @IsEnum(ChecklistType)
  type: ChecklistType;
}
