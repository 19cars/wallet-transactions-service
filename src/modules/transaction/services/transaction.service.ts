import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import {
  CreateTransactionDto,
  TransactionType,
} from '../dto/create-transaction.dto';
import { CreateTransferDto } from '../dto/create-transfer.dto';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  async createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      id: uuidv4(),
      type: dto.type,
      walletId: dto.walletId,
      amount: dto.amount,
      currency: dto.currency,
      status: TransactionStatus.COMPLETED,
      metadata: dto.metadata ? JSON.stringify(dto.metadata) : undefined,
      completedAt: new Date(),
    });

    try {
      return await this.transactionRepository.save(transaction);
    } catch (error) {
      this.logger.error(`Failed to create transaction: ${error}`);
      throw new InternalServerErrorException('Failed to create transaction');
    }
  }

  async createTransfer(
    dto: CreateTransferDto,
  ): Promise<{ source: Transaction; target: Transaction }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sourceTransaction = queryRunner.manager.create(Transaction, {
        id: uuidv4(),
        type: TransactionType.DEBIT,
        walletId: dto.sourceWalletId,
        amount: dto.amount,
        currency: dto.currency,
        status: TransactionStatus.COMPLETED,
        completedAt: new Date(),
      });

      const savedSource = await queryRunner.manager.save(sourceTransaction);

      const targetTransaction = queryRunner.manager.create(Transaction, {
        id: uuidv4(),
        type: TransactionType.CREDIT,
        walletId: dto.targetWalletId,
        amount: dto.amount,
        currency: dto.currency,
        status: TransactionStatus.COMPLETED,
        relatedTransactionId: savedSource.id,
        completedAt: new Date(),
      });

      const savedTarget = await queryRunner.manager.save(targetTransaction);

      await queryRunner.commitTransaction();

      return { source: savedSource, target: savedTarget };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create transfer: ${error}`);
      throw new InternalServerErrorException('Failed to create transfer');
    } finally {
      await queryRunner.release();
    }
  }

  async reverseTransaction(transactionId: string): Promise<Transaction> {
    const original = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!original) {
      throw new InternalServerErrorException('Transaction not found');
    }

    const reversalType =
      original.type === TransactionType.DEBIT
        ? TransactionType.CREDIT
        : TransactionType.DEBIT;

    const reversal = this.transactionRepository.create({
      id: uuidv4(),
      type: reversalType,
      walletId: original.walletId,
      amount: original.amount,
      currency: original.currency,
      status: TransactionStatus.COMPLETED,
      relatedTransactionId: transactionId,
      completedAt: new Date(),
    });

    try {
      return await this.transactionRepository.save(reversal);
    } catch (error) {
      this.logger.error(`Failed to reverse transaction: ${error}`);
      throw new InternalServerErrorException('Failed to reverse transaction');
    }
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.transactionRepository.findOne({
      where: { id },
    });
  }
}
