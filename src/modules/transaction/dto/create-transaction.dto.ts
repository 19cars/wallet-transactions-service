import { IsEnum, IsUUID, IsOptional, IsObject, IsString, Matches } from 'class-validator';
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

  @ApiProperty({ description: 'Amount in currency units', example: '25.50' })
  @IsString()
  @Matches(/^\d+(\.\d{1,4})?$/, {
    message: 'amount must be a numeric string with up to 4 decimal places',
  })
  amount!: string;

  @ApiProperty({ description: 'Currency code', default: 'USD' })
  @IsString()
  currency!: string;

  @ApiProperty({ required: false, description: 'Description of the transaction' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, description: 'External reference' })
  @IsOptional()
  @IsString()
  externalReference?: string;

  @ApiProperty({ required: false, description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
