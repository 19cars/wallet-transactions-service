import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../services/transaction.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import { DataSource } from 'typeorm';
import { CreateTransactionDto, TransactionType } from '../dto/create-transaction.dto';

describe('TransactionService', () => {
  let service: TransactionService;
  let mockRepository: any;
  let mockDataSource: any;

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
        amount: 100,
        currency: 'USD',
      };

      const mockTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        ...dto,
        status: TransactionStatus.COMPLETED,
      };

      mockRepository.create.mockReturnValue(mockTransaction);
      mockRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.createTransaction(dto);

      expect(result).toEqual(mockTransaction);
      expect(mockRepository.create).toHaveBeenCalledWith(expect.any(Object));
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
