import { Test, TestingModule } from '@nestjs/testing';
import { LedgerService } from '../src/modules/ledger/services/ledger.service';
import { WalletService } from '../src/modules/wallet/wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LedgerEntry } from '../src/modules/ledger/entities/ledger-entry.entity';

describe('LedgerService', () => {
  let service: LedgerService;
  let mockRepository: any;
  let mockWalletService: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
    };

    mockWalletService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LedgerService,
        {
          provide: getRepositoryToken(LedgerEntry),
          useValue: mockRepository,
        },
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
      ],
    }).compile();

    service = module.get<LedgerService>(LedgerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBalance', () => {
    it('should return wallet balance', async () => {
      const walletId = '123e4567-e89b-12d3-a456-426614174000';
      const mockWallet = {
        walletId,
        availableBalance: '1000.0000',
        currency: 'USD',
      };
      const mockEntry = {
        walletId,
        balance: '1000.0000',
        currency: 'USD',
        createdAt: new Date(),
      };

      mockWalletService.findById.mockResolvedValue(mockWallet);
      mockRepository.findOne.mockResolvedValue(mockEntry);

      const result = await service.getBalance(walletId);

      expect(result).toEqual({
        walletId,
        currency: 'USD',
        availableBalance: '1000.0000',
        lastUpdated: mockEntry.createdAt,
      });
    });
  });

  describe('getMovements', () => {
    it('should return wallet movements', async () => {
      const walletId = '123e4567-e89b-12d3-a456-426614174000';
      const mockEntries = [
        {
          id: '1',
          walletId,
          type: 'CREDIT',
          debitAmount: '0.0000',
          creditAmount: '100.0000',
          balance: '100.0000',
          currency: 'USD',
          status: 'COMPLETED',
          sourceTransactionId: 'tx-1',
          createdAt: new Date(),
        },
      ];

      mockRepository.findAndCount.mockResolvedValue([mockEntries, 1]);

      const result = await service.getMovements(walletId, {
        type: 'ALL',
        status: undefined,
        page: 1,
        pageSize: 20,
      });

      expect(result.movements).toHaveLength(1);
      expect(result.movements[0].type).toBe('CREDIT');
      expect(result.movements[0].transactionId).toBe('tx-1');
      expect(mockRepository.findAndCount).toHaveBeenCalled();
    });
  });
});
