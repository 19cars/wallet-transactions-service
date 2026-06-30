import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiConflictResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionService } from './services/transaction.service';
import { IdempotencyService } from './services/idempotency.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { ReverseTransactionDto } from './dto/reverse-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';

@ApiTags('transactions')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(
    private readonly transactionService: TransactionService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Transaction created successfully' })
  @ApiConflictResponse({ description: 'Idempotency conflict' })
  async create(
    @Body() dto: CreateTransactionDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<Transaction | { error: string } | Record<string, unknown>> {
    if (idempotencyKey) {
      const cached = await this.idempotencyService.checkIdempotency(
        idempotencyKey,
        dto as unknown as Record<string, unknown>,
      );

      if (cached.cached) {
        this.logger.debug(`Returning cached response for idempotency key: ${idempotencyKey}`);
        return cached.response || {};
      }
    }

    const transaction = await this.transactionService.createTransaction(dto);

    if (idempotencyKey) {
      await this.idempotencyService.storeIdempotency(
        idempotencyKey,
        dto as unknown as Record<string, unknown>,
        transaction as unknown as Record<string, unknown>,
        HttpStatus.CREATED,
      );
    }

    return transaction;
  }

  @Post('transfer')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Transfer created successfully' })
  async transfer(
    @Body() dto: CreateTransferDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<Record<string, unknown>> {
    if (idempotencyKey) {
      const cached = await this.idempotencyService.checkIdempotency(
        idempotencyKey,
        dto as unknown as Record<string, unknown>,
      );

      if (cached.cached) {
        return cached.response || {};
      }
    }

    const result = await this.transactionService.createTransfer(dto);

    if (idempotencyKey) {
      await this.idempotencyService.storeIdempotency(
        idempotencyKey,
        dto as unknown as Record<string, unknown>,
        result as unknown as Record<string, unknown>,
        HttpStatus.CREATED,
      );
    }

    return result;
  }

  @Post(':id/reversal')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Transaction reversed successfully' })
  async reversal(
    @Param('id') id: string,
    @Body() dto: ReverseTransactionDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<Transaction | { error: string } | Record<string, unknown>> {
    const body = { transactionId: id, ...dto };

    if (idempotencyKey) {
      const cached = await this.idempotencyService.checkIdempotency(
        idempotencyKey,
        body as Record<string, unknown>,
      );

      if (cached.cached) {
        return cached.response || {};
      }
    }

    const reversal = await this.transactionService.reverseTransaction(id, dto);

    if (idempotencyKey) {
      await this.idempotencyService.storeIdempotency(
        idempotencyKey,
        body as Record<string, unknown>,
        reversal as unknown as Record<string, unknown>,
        HttpStatus.CREATED,
      );
    }

    return reversal;
  }

  @Get(':id')
  @ApiCreatedResponse({ description: 'Transaction retrieved successfully' })
  //async findById(@Param('id') id: string): Promise<Record<string, unknown>> {
  async findById(@Param('id') id: string): Promise<Transaction | { error: string }> {
    const transaction = await this.transactionService.findById(id);

    if (!transaction) {
      return { error: 'Transaction not found' };
    }

    return transaction;
  }
}
