import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './controllers/health.controller';
import { HealthService } from './services/health.service';
import { SeedService } from './services/seed.service';
import { CorrelationIdMiddleware } from './middleware/correlation-id.middleware';
import { Transaction } from '@modules/transaction/entities/transaction.entity';
import { LedgerEntry } from '@modules/ledger/entities/ledger-entry.entity';
import { Wallet } from '@modules/wallet/entities/wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, LedgerEntry, Wallet])],
  controllers: [HealthController],
  providers: [HealthService, SeedService],
  exports: [HealthService],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
