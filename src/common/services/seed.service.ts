import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from '@modules/transaction/entities/transaction.entity';
import { TransactionStatus } from '@modules/transaction/entities/transaction.entity';
import { LedgerEntry } from '@modules/ledger/entities/ledger-entry.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(LedgerEntry)
    private readonly ledgerRepository: Repository<LedgerEntry>,
  ) {}

  async onModuleInit() {
    if (this.configService.get('NODE_ENV') === 'development') {
      await this.seed();
    }
  }

  async seed(): Promise<void> {
    try {
      // Check if data already exists (idempotency)
      const transactionCount = await this.transactionRepository.count();

      if (transactionCount > 0) {
        this.logger.log('Database already seeded. Skipping seed execution.');
        return;
      }

      this.logger.log('Starting database seed with test data...');

      // Create test wallet IDs
      const wallet1Id = 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6';
      const wallet2Id = 'b2c3d4e5-f6a7-48b9-c0d1-e2f3a4b5c6d7';
      const wallet3Id = 'c3d4e5f6-a7b8-49c0-d1e2-f3a4b5c6d7e8';

      // Transaction 1: Credit to wallet 1
      const transaction1Id = uuidv4();
      const creditTransaction = this.transactionRepository.create({
        id: transaction1Id,
        type: 'CREDIT',
        walletId: wallet1Id,
        amount: 1000.0,
        currency: 'USD',
        status: TransactionStatus.COMPLETED,
        metadata: JSON.stringify({ description: 'Initial credit' }),
        createdAt: new Date(),
        completedAt: new Date(),
      });

      // Transaction 2: Debit from wallet 1
      const transaction2Id = uuidv4();
      const debitTransaction = this.transactionRepository.create({
        id: transaction2Id,
        type: 'DEBIT',
        walletId: wallet1Id,
        amount: 250.0,
        currency: 'USD',
        status: TransactionStatus.COMPLETED,
        metadata: JSON.stringify({ description: 'Purchase' }),
        createdAt: new Date(),
        completedAt: new Date(),
      });

      // Transaction 3: Credit to wallet 2
      const transaction3Id = uuidv4();
      const creditTransaction2 = this.transactionRepository.create({
        id: transaction3Id,
        type: 'CREDIT',
        walletId: wallet2Id,
        amount: 500.0,
        currency: 'USD',
        status: TransactionStatus.COMPLETED,
        metadata: JSON.stringify({ description: 'Transfer received' }),
        createdAt: new Date(),
        completedAt: new Date(),
      });

      // Transaction 4: Transfer (debit from wallet 2)
      const transaction4Id = uuidv4();
      const debitTransaction2 = this.transactionRepository.create({
        id: transaction4Id,
        type: 'DEBIT',
        walletId: wallet2Id,
        amount: 500.0,
        currency: 'USD',
        status: TransactionStatus.COMPLETED,
        metadata: JSON.stringify({ description: 'Transfer to wallet 1' }),
        createdAt: new Date(),
        completedAt: new Date(),
      });

      // Transaction 5: Credit to wallet 3
      const transaction5Id = uuidv4();
      const creditTransaction3 = this.transactionRepository.create({
        id: transaction5Id,
        type: 'CREDIT',
        walletId: wallet3Id,
        amount: 2000.0,
        currency: 'USD',
        status: TransactionStatus.COMPLETED,
        metadata: JSON.stringify({ description: 'Initial credit' }),
        createdAt: new Date(),
        completedAt: new Date(),
      });

      // Save transactions
      await this.transactionRepository.save([
        creditTransaction,
        debitTransaction,
        creditTransaction2,
        debitTransaction2,
        creditTransaction3,
      ]);

      this.logger.log('Transactions inserted successfully');

      // Create corresponding ledger entries
      // For wallet 1: after credit, balance = 1000
      const ledgerEntry1 = this.ledgerRepository.create({
        id: uuidv4(),
        walletId: wallet1Id,
        type: 'CREDIT',
        debitAmount: 0,
        creditAmount: 1000.0,
        balance: 1000.0,
        currency: 'USD',
        sourceTransactionId: transaction1Id,
        createdAt: new Date(),
      });

      // For wallet 1: after debit, balance = 750
      const ledgerEntry2 = this.ledgerRepository.create({
        id: uuidv4(),
        walletId: wallet1Id,
        type: 'DEBIT',
        debitAmount: 250.0,
        creditAmount: 0,
        balance: 750.0,
        currency: 'USD',
        sourceTransactionId: transaction2Id,
        createdAt: new Date(),
      });

      // For wallet 2: after credit, balance = 500
      const ledgerEntry3 = this.ledgerRepository.create({
        id: uuidv4(),
        walletId: wallet2Id,
        type: 'CREDIT',
        debitAmount: 0,
        creditAmount: 500.0,
        balance: 500.0,
        currency: 'USD',
        sourceTransactionId: transaction3Id,
        createdAt: new Date(),
      });

      // For wallet 2: after debit, balance = 0
      const ledgerEntry4 = this.ledgerRepository.create({
        id: uuidv4(),
        walletId: wallet2Id,
        type: 'DEBIT',
        debitAmount: 500.0,
        creditAmount: 0,
        balance: 0,
        currency: 'USD',
        sourceTransactionId: transaction4Id,
        createdAt: new Date(),
      });

      // For wallet 3: after credit, balance = 2000
      const ledgerEntry5 = this.ledgerRepository.create({
        id: uuidv4(),
        walletId: wallet3Id,
        type: 'CREDIT',
        debitAmount: 0,
        creditAmount: 2000.0,
        balance: 2000.0,
        currency: 'USD',
        sourceTransactionId: transaction5Id,
        createdAt: new Date(),
      });

      // Save ledger entries
      await this.ledgerRepository.save([
        ledgerEntry1,
        ledgerEntry2,
        ledgerEntry3,
        ledgerEntry4,
        ledgerEntry5,
      ]);

      this.logger.log(
        'Ledger entries inserted successfully. Seed completed successfully.',
      );
      this.logger.log(`Test data: Wallet 1 (${wallet1Id}) - Balance: $750.00`);
      this.logger.log(`Test data: Wallet 2 (${wallet2Id}) - Balance: $0.00`);
      this.logger.log(`Test data: Wallet 3 (${wallet3Id}) - Balance: $2000.00`);
    } catch (error) {
      this.logger.error(
        `Error seeding database: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
