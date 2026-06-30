import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';

@ApiTags('wallets')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ description: 'Wallet created successfully' })
  async createWallet(@Body() dto: CreateWalletDto) {
    return this.walletService.createWallet(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Wallets retrieved successfully' })
  async findAll() {
    return this.walletService.findAll();
  }
}
