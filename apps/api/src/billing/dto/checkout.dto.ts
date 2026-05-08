import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ description: 'Slug do plano: basico | pro | business' })
  @IsString()
  planSlug: string;
}
