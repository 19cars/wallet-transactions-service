import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import { CreateTransactionDto, TransactionType } from '../dto/create-transaction.dto';
import { CreateTransferDto } from '../dto/create-transfer.dto';
import { ReverseTransactionDto } from '../dto/reverse-transaction.dto';
import { WalletService } from '@modules/wallet/wallet.service';
import { LedgerService } from '@modules/ledger/services/ledger.service';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly walletService: WalletService,
    private readonly ledgerService: LedgerService,
    private readonly dataSource: DataSource,
  ) {}

  async createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
    await this.walletService.validateCurrency(dto.walletId, dto.currency);
    await this.walletService.validateActive(dto.walletId);

    const wallet = await this.walletService.findById(dto.walletId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const currentBalance = parseFloat(wallet.availableBalance);
    const amount = parseFloat(dto.amount);

    if (dto.type === TransactionType.DEBIT && currentBalance < amount) {
      throw new BadRequestException('Insufficient wallet balance for debit');
    }

    const newBalance =
      dto.type === TransactionType.DEBIT ? currentBalance - amount : currentBalance + amount;

    const transaction = this.transactionRepository.create({
      id: uuidv4(),
      type: dto.type,
      walletId: dto.walletId,
      amount: dto.amount,
      currency: dto.currency,
      status: TransactionStatus.COMPLETED,
      description: dto.description,
      externalReference: dto.externalReference,
      metadata: dto.metadata ? JSON.stringify(dto.metadata) : undefined,
      completedAt: new Date(),
    });

    try {
      const created = await this.transactionRepository.save(transaction);

      await this.walletService.updateBalance(dto.walletId, newBalance.toFixed(4));
      await this.ledgerService.recordEntry(
        dto.walletId,
        dto.type,
        dto.amount,
        dto.currency,
        created.id,
        TransactionStatus.COMPLETED,
      );
      return created;
    } catch (error) {
      this.logger.error(`Failed to create transaction: ${error}`);
      throw new InternalServerErrorException('Failed to create transaction');
    }
  }

  async createTransfer(
    dto: CreateTransferDto,
  ): Promise<{ source: Transaction; target: Transaction }> {
    await this.walletService.validateCurrency(dto.sourceWalletId, dto.currency);
    await this.walletService.validateCurrency(dto.targetWalletId, dto.currency);
    await this.walletService.validateActive(dto.sourceWalletId);
    await this.walletService.validateActive(dto.targetWalletId);

    const sourceWallet = await this.walletService.findById(dto.sourceWalletId);
    const targetWallet = await this.walletService.findById(dto.targetWalletId);

    if (!sourceWallet || !targetWallet) {
      throw new NotFoundException('Source or target wallet not found');
    }

    const sourceBalance = parseFloat(sourceWallet.availableBalance);
    const amount = parseFloat(dto.amount);

    if (sourceBalance < amount) {
      throw new BadRequestException('Source wallet has insufficient balance for transfer');
    }

    const sourceNewBalance = sourceBalance - amount;
    const targetNewBalance = parseFloat(targetWallet.availableBalance) + amount;

    try {
      const sourceTransaction = this.transactionRepository.create({
        id: uuidv4(),
        type: TransactionType.DEBIT,
        walletId: dto.sourceWalletId,
        amount: dto.amount,
        currency: dto.currency,
        status: TransactionStatus.COMPLETED,
        description: dto.description,
        completedAt: new Date(),
      });

      const savedSource = await this.transactionRepository.save(sourceTransaction);

      const targetTransaction = this.transactionRepository.create({
        id: uuidv4(),
        type: TransactionType.CREDIT,
        walletId: dto.targetWalletId,
        amount: dto.amount,
        currency: dto.currency,
        status: TransactionStatus.COMPLETED,
        relatedTransactionId: savedSource.id,
        description: dto.description,
        completedAt: new Date(),
      });

      const savedTarget = await this.transactionRepository.save(targetTransaction);

      await this.walletService.updateBalance(dto.sourceWalletId, sourceNewBalance.toFixed(4));
      await this.walletService.updateBalance(dto.targetWalletId, targetNewBalance.toFixed(4));

      await this.ledgerService.recordEntry(
        dto.sourceWalletId,
        TransactionType.DEBIT,
        dto.amount,
        dto.currency,
        savedSource.id,
        TransactionStatus.COMPLETED,
      );

      await this.ledgerService.recordEntry(
        dto.targetWalletId,
        TransactionType.CREDIT,
        dto.amount,
        dto.currency,
        savedTarget.id,
        TransactionStatus.COMPLETED,
      );

      return { source: savedSource, target: savedTarget };
    } catch (error) {
      this.logger.error(`Failed to create transfer: ${error}`);
      throw new InternalServerErrorException('Failed to create transfer');
    }
  }

  async reverseTransaction(
    transactionId: string,
    dto: ReverseTransactionDto,
  ): Promise<Transaction> {
    const original = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!original) {
      throw new NotFoundException('Transaction not found');
    }

    if (original.relatedTransactionId) {
      throw new BadRequestException('Cannot reverse a reversal transaction');
    }

    if (original.status === TransactionStatus.REVERSED) {
      throw new UnprocessableEntityException('Cannot reverse a reversal transaction');
    }

    const reversalType =
      original.type === TransactionType.DEBIT ? TransactionType.CREDIT : TransactionType.DEBIT;

    await this.walletService.validateCurrency(original.walletId, original.currency);
    await this.walletService.validateActive(original.walletId);

    const wallet = await this.walletService.findById(original.walletId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const currentBalance = parseFloat(wallet.availableBalance);
    const amount = parseFloat(original.amount);
    const newBalance =
      reversalType === TransactionType.DEBIT ? currentBalance - amount : currentBalance + amount;

    if (newBalance < 0) {
      throw new BadRequestException('Wallet balance cannot go negative on reversal');
    }

    const reversal = this.transactionRepository.create({
      id: uuidv4(),
      type: reversalType,
      walletId: original.walletId,
      amount: original.amount,
      currency: original.currency,
      status: TransactionStatus.COMPLETED,
      relatedTransactionId: transactionId,
      description: dto.reason,
      externalReference: dto.externalReference,
      completedAt: new Date(),
    });

    try {
      const savedReversal = await this.transactionRepository.save(reversal);
      await this.walletService.updateBalance(original.walletId, newBalance.toFixed(4));
      await this.ledgerService.recordEntry(
        original.walletId,
        reversalType,
        original.amount,
        original.currency,
        savedReversal.id,
        TransactionStatus.COMPLETED,
      );
      await this.transactionRepository.save({
        ...original,
        status: TransactionStatus.REVERSED,
      });
      return savedReversal;
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
