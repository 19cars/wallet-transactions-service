import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Username for login', example: 'senior.backend' })
  @IsString()
  username!: string;

  @ApiProperty({ description: 'Password for login', example: 'Password123' })
  @IsString()
  @MinLength(8)
  password!: string;
}
