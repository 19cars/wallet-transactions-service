import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { IdempotencyKey } from './entities/idempotency-key.entity';
import { TransactionService } from './services/transaction.service';
import { IdempotencyService } from './services/idempotency.service';
import { TransactionController } from './transaction.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, IdempotencyKey])],
  controllers: [TransactionController],
  providers: [TransactionService, IdempotencyService],
  exports: [TransactionService],
})
export class TransactionModule {}
