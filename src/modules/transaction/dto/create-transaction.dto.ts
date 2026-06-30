import { IsEnum, IsUUID, IsNumber, IsOptional, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TransactionType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType, description: 'Type of transaction' })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty({ description: 'UUID of the wallet', format: 'uuid' })
  @IsUUID()
  walletId!: string;

  @ApiProperty({ description: 'Amount in currency units', type: Number })
  @IsNumber()
  amount!: number;

  @ApiProperty({ description: 'Currency code', default: 'USD' })
  @IsString()
  currency!: string;

  @ApiProperty({ required: false, description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
