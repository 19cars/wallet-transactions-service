import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WalletStatus } from '../entities/wallet.entity';

export class CreateWalletDto {
  @ApiProperty({ description: 'Currency code for the wallet', example: 'PEN' })
  @IsString()
  currency!: string;

  @ApiProperty({ enum: WalletStatus, description: 'Wallet status', example: WalletStatus.ACTIVE })
  @IsEnum(WalletStatus)
  status!: WalletStatus;

  /*@ApiProperty({ description: 'Initial available balance', example: '0.0000', required: false })
  @IsOptional()
  @IsString()
  availableBalance?: string;*/
}
