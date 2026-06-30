import { Controller, Get, Param, Query, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BalanceResponse, LedgerService, MovementPageResponse } from './services/ledger.service';
import { MovementQueryDto } from '../transaction/dto/movement-query.dto';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';

@ApiTags('ledger')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class LedgerController {
  private readonly logger = new Logger(LedgerController.name);

  constructor(private readonly ledgerService: LedgerService) {}

  @Get(':walletId/balance')
  @ApiOkResponse({ description: 'Wallet balance retrieved successfully' })
  async getBalance(@Param('walletId') walletId: string): Promise<BalanceResponse> {
    return this.ledgerService.getBalance(walletId);
  }

  @Get(':walletId/movements')
  @ApiOkResponse({ description: 'Wallet movements retrieved successfully' })
  async getMovements(
    @Param('walletId') walletId: string,
    @Query() query: MovementQueryDto,
  ): Promise<MovementPageResponse> {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 20;

    return this.ledgerService.getMovements(walletId, {
      type: query.type,
      status: query.status,
      page,
      pageSize,
    });
  }
}
