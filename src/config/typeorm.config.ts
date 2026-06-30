import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Transaction } from '@modules/transaction/entities/transaction.entity';
import { IdempotencyKey } from '@modules/transaction/entities/idempotency-key.entity';
import { LedgerEntry } from '@modules/ledger/entities/ledger-entry.entity';
import { Wallet } from '@modules/wallet/entities/wallet.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isProduction = this.config.get('NODE_ENV') === 'production';
    const isSynchronize = this.config.get('DATABASE_SYNCHRONIZE') === 'true';

    return {
      type: 'postgres',
      host: this.config.get<string>('DATABASE_HOST', 'localhost'),
      port: this.config.get<number>('DATABASE_PORT', 5432),
      username: this.config.get<string>('DATABASE_USER', 'wallet_user'),
      password: this.config.get<string>('DATABASE_PASSWORD', 'wallet_password'),
      database: this.config.get<string>('DATABASE_NAME', 'WalletDB'),
      entities: [Transaction, IdempotencyKey, LedgerEntry, Wallet],
      synchronize: isSynchronize && !isProduction,
      logging: !isProduction,
      dropSchema: false,
    };
  }
}
