import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { LedgerEntry } from '../entities/ledger-entry.entity';

export interface BalanceResponse {
  walletId: string;
  balance: number;
  currency: string;
  lastUpdated: Date;
}

export interface MovementResponse {
  id: string;
  type: string;
  amount: number;
  balance: number;
  currency: string;
  createdAt: Date;
}

@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(
    @InjectRepository(LedgerEntry)
    private readonly ledgerRepository: Repository<LedgerEntry>,
  ) {}

  async recordEntry(
    walletId: string,
    type: string,
    amount: number,
    currency: string,
    sourceTransactionId: string,
  ): Promise<LedgerEntry> {
    const debitAmount = type === 'DEBIT' ? amount : 0;
    const creditAmount = type === 'CREDIT' ? amount : 0;

    const lastEntry = await this.ledgerRepository.findOne({
      where: { walletId },
      order: { createdAt: 'DESC' },
    });

    const previousBalance = lastEntry?.balance || 0;
    const newBalance = previousBalance + creditAmount - debitAmount;

    const entry = this.ledgerRepository.create({
      id: uuidv4(),
      walletId,
      type,
      debitAmount,
      creditAmount,
      balance: newBalance,
      currency,
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
    const lastEntry = await this.ledgerRepository.findOne({
      where: { walletId },
      order: { createdAt: 'DESC' },
    });

    return {
      walletId,
      balance: lastEntry?.balance || 0,
      currency: lastEntry?.currency || 'USD',
      lastUpdated: lastEntry?.createdAt || new Date(),
    };
  }

  async getMovements(
    walletId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<MovementResponse[]> {
    const entries = await this.ledgerRepository.find({
      where: { walletId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return entries.map((entry) => ({
      id: entry.id,
      type: entry.type,
      amount: entry.type === 'DEBIT' ? entry.debitAmount : entry.creditAmount,
      balance: entry.balance,
      currency: entry.currency,
      createdAt: entry.createdAt,
    }));
  }

  async getMovementsByTransaction(
    transactionId: string,
  ): Promise<MovementResponse[]> {
    const entries = await this.ledgerRepository.find({
      where: { sourceTransactionId: transactionId },
      order: { createdAt: 'ASC' },
    });

    return entries.map((entry) => ({
      id: entry.id,
      type: entry.type,
      amount: entry.type === 'DEBIT' ? entry.debitAmount : entry.creditAmount,
      balance: entry.balance,
      currency: entry.currency,
      createdAt: entry.createdAt,
    }));
  }
}
