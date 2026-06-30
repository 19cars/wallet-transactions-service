import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '@modules/transaction/services/transaction.service';
import { WalletService } from '@modules/wallet/wallet.service';
import { LedgerService } from '@modules/ledger/services/ledger.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction, TransactionStatus } from '@modules/transaction/entities/transaction.entity';
import { DataSource } from 'typeorm';
import {
  CreateTransactionDto,
  TransactionType,
} from '@modules/transaction/dto/create-transaction.dto';

describe('TransactionService', () => {
  let service: TransactionService;
  let mockRepository: any;
  let mockDataSource: any;
  let mockWalletService: any;
  let mockLedgerService: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        manager: {
          create: jest.fn(),
          save: jest.fn(),
        },
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      }),
    };

    mockWalletService = {
      findById: jest.fn(),
      validateCurrency: jest.fn(),
      validateActive: jest.fn(),
      updateBalance: jest.fn(),
    };

    mockLedgerService = {
      recordEntry: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
        {
          provide: LedgerService,
          useValue: mockLedgerService,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTransaction', () => {
    it('should create a transaction', async () => {
      const dto: CreateTransactionDto = {
        type: TransactionType.DEBIT,
        walletId: '123e4567-e89b-12d3-a456-426614174000',
        amount: '100.0000',
        currency: 'USD',
      };

      const mockWallet = {
        walletId: dto.walletId,
        availableBalance: '200.0000',
        currency: dto.currency,
      };

      const mockTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        type: dto.type,
        walletId: dto.walletId,
        amount: dto.amount,
        currency: dto.currency,
        status: TransactionStatus.COMPLETED,
        description: undefined,
        externalReference: undefined,
        metadata: undefined,
      };

      mockWalletService.findById.mockResolvedValue(mockWallet);
      mockWalletService.validateCurrency.mockResolvedValue(undefined);
      mockWalletService.validateActive.mockResolvedValue(undefined);
      mockWalletService.updateBalance.mockResolvedValue({
        ...mockWallet,
        availableBalance: '100.0000',
      });
      mockLedgerService.recordEntry.mockResolvedValue(mockTransaction);
      mockRepository.create.mockReturnValue(mockTransaction);
      mockRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.createTransaction(dto);

      expect(result).toEqual(mockTransaction);
      expect(mockWalletService.validateCurrency).toHaveBeenCalledWith(dto.walletId, dto.currency);
      expect(mockWalletService.validateActive).toHaveBeenCalledWith(dto.walletId);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: dto.type,
          walletId: dto.walletId,
          amount: dto.amount,
          currency: dto.currency,
        }),
      );
      expect(mockRepository.save).toHaveBeenCalledWith(mockTransaction);
    });
  });

  describe('findById', () => {
    it('should find a transaction by id', async () => {
      const mockTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        type: TransactionType.DEBIT,
        walletId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 100,
        currency: 'USD',
      };

      mockRepository.findOne.mockResolvedValue(mockTransaction);

      const result = await service.findById('123e4567-e89b-12d3-a456-426614174001');

      expect(result).toEqual(mockTransaction);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174001' },
      });
    });
  });
});
