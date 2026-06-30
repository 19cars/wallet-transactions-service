import { IsUUID, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransferDto {
  @ApiProperty({ description: 'Source wallet UUID', format: 'uuid' })
  @IsUUID()
  sourceWalletId!: string;

  @ApiProperty({ description: 'Target wallet UUID', format: 'uuid' })
  @IsUUID('all')
  targetWalletId!: string;

  @ApiProperty({ description: 'Amount to transfer', type: Number })
  @IsNumber()
  amount!: number;

  @ApiProperty({ description: 'Currency code', default: 'USD' })
  @IsString()
  currency!: string;
}
