import { IsUUID, IsString, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransferDto {
  @ApiProperty({ description: 'Source wallet UUID', format: 'uuid' })
  @IsUUID()
  sourceWalletId!: string;

  @ApiProperty({ description: 'Target wallet UUID', format: 'uuid' })
  @IsUUID('all')
  targetWalletId!: string;

  @ApiProperty({ description: 'Amount to transfer', example: '100.00' })
  @IsString()
  @Matches(/^\d+(\.\d{1,4})?$/, {
    message: 'amount must be a numeric string with up to 4 decimal places',
  })
  amount!: string;

  @ApiProperty({ description: 'Currency code', default: 'USD' })
  @IsString()
  currency!: string;

  @ApiProperty({ required: false, description: 'Description of the transfer' })
  @IsOptional()
  @IsString()
  description?: string;
}
