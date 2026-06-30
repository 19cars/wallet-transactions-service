import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { LedgerEntry } from '../entities/ledger-entry.entity';
import { WalletService } from '@modules/wallet/wallet.service';

export interface BalanceResponse {
  walletId: string;
  currency: string;
  availableBalance: string;
  lastUpdated: Date;
}

export interface MovementResponse {
  transactionId: string;
  amount: string;
  type: string;
  status: string;
  currency: string;
  createdAt: Date;
}

export interface MovementPageResponse {
  walletId: string;
  total: number;
  movements: MovementResponse[];
}

export interface MovementQuery {
  type?: string;
  status?: string;
  page: number;
  pageSize: number;
}

@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(
    @InjectRepository(LedgerEntry)
    private readonly ledgerRepository: Repository<LedgerEntry>,
    private readonly walletService: WalletService,
  ) {}

  async recordEntry(
    walletId: string,
    type: string,
    amount: string,
    currency: string,
    sourceTransactionId: string,
    status: string,
  ): Promise<LedgerEntry> {
    const debitAmount = type === 'DEBIT' ? amount : '0.0000';
    const creditAmount = type === 'CREDIT' ? amount : '0.0000';

    const lastEntry = await this.ledgerRepository.findOne({
      where: { walletId },
      order: { createdAt: 'DESC' },
    });

    const previousBalance = lastEntry ? parseFloat(lastEntry.balance) : 0;
    const newBalance =
      type === 'DEBIT'
        ? previousBalance - parseFloat(amount)
        : previousBalance + parseFloat(amount);

    const entry = this.ledgerRepository.create({
      id: uuidv4(),
      walletId,
      type,
      debitAmount,
      creditAmount,
      balance: newBalance.toFixed(4),
      currency,
      status,
      sourceTransactionId,
    });

    try {
      return await this.ledgerRepository.save(entry);
    } catch (error) {
      this.logger.error(`Failed to record ledger entry: ${error}`);
      throw error;
    }
  }

  async getBalance(walletId: string): Promise<BalanceResponse> {
    const wallet = await this.walletService.findById(walletId);
    const lastEntry = await this.ledgerRepository.findOne({
      where: { walletId },
      order: { createdAt: 'DESC' },
    });

    return {
      walletId,
      currency: wallet?.currency || lastEntry?.currency || 'USD',
      availableBalance: wallet?.availableBalance || lastEntry?.balance || '0.0000',
      lastUpdated: lastEntry?.createdAt || new Date(),
    };
  }

  async getMovements(walletId: string, query: MovementQuery): Promise<MovementPageResponse> {
    const where: Record<string, unknown> = { walletId };

    if (query.type && query.type !== 'ALL') {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [entries, total] = await this.ledgerRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: query.pageSize,
      skip: (query.page - 1) * query.pageSize,
    });

    return {
      walletId,
      total,
      movements: entries.map((entry) => ({
        transactionId: entry.sourceTransactionId,
        amount: entry.type === 'DEBIT' ? entry.debitAmount : entry.creditAmount,
        type: entry.type,
        status: entry.status,
        currency: entry.currency,
        createdAt: entry.createdAt,
      })),
    };
  }
}
