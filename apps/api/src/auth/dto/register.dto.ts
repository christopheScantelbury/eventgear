import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'ScantelburyDevs' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  companyName: string;

  @ApiPropertyOptional({ example: '+5511999999999' })
  @IsOptional()
  @IsString()
  companyPhone?: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'joao@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'minhasenha123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
