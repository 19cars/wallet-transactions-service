import { Test, TestingModule } from '@nestjs/testing';
import { LedgerService } from '../src/modules/ledger/services/ledger.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LedgerEntry } from '../src/modules/ledger/entities/ledger-entry.entity';

describe('LedgerService', () => {
  let service: LedgerService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LedgerService,
        {
          provide: getRepositoryToken(LedgerEntry),
          useValue: mockRepository,
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
      const mockEntry = {
        walletId,
        balance: 1000,
        currency: 'USD',
        createdAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockEntry);

      const result = await service.getBalance(walletId);

      expect(result).toEqual({
        walletId,
        balance: 1000,
        currency: 'USD',
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
          debitAmount: 0,
          creditAmount: 100,
          balance: 100,
          currency: 'USD',
          createdAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(mockEntries);

      const result = await service.getMovements(walletId);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('CREDIT');
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });
});
