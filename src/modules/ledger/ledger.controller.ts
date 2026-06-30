import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import {
  BalanceResponse,
  LedgerService,
  MovementResponse,
} from './services/ledger.service';

@ApiTags('ledger')
@Controller('wallets')
export class LedgerController {
  private readonly logger = new Logger(LedgerController.name);

  constructor(private readonly ledgerService: LedgerService) {}

  @Get(':walletId/balance')
  @ApiOkResponse({ description: 'Wallet balance retrieved successfully' })
  async getBalance(
    @Param('walletId') walletId: string,
  ): Promise<BalanceResponse> {
    return this.ledgerService.getBalance(walletId);
  }

  @Get(':walletId/movements')
  @ApiOkResponse({ description: 'Wallet movements retrieved successfully' })
  async getMovements(
    @Param('walletId') walletId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<MovementResponse[]> {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;

    return this.ledgerService.getMovements(walletId, parsedLimit, parsedOffset);
  }
}
