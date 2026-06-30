import { IsEnum, IsOptional, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum MovementType {
  ALL = 'ALL',
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export enum MovementStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}

export class MovementQueryDto {
  @ApiPropertyOptional({ enum: MovementType, default: MovementType.ALL })
  @IsOptional()
  @IsEnum(MovementType)
  type?: MovementType;

  @ApiPropertyOptional({ enum: MovementStatus, default: MovementStatus.COMPLETED })
  @IsOptional()
  @IsEnum(MovementStatus)
  status?: MovementStatus;

  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ description: 'Page size', example: 20 })
  @IsOptional()
  @IsNumberString()
  pageSize?: string;
}
