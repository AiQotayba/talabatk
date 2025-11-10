import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: ['client', 'driver', 'admin'], example: 'client' })
  @IsEnum(['client', 'driver', 'admin'])
  role: 'client' | 'driver' | 'admin';

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;
}
