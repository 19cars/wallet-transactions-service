import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReverseTransactionDto {
  @ApiProperty({ description: 'Reason for reversal', example: 'Merchant refund / reversal' })
  @IsString()
  reason!: string;

  @ApiProperty({
    description: 'External reference for the reversal',
    example: 'rev_123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  externalReference?: string;
}
