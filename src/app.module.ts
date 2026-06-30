import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionModule } from '@modules/transaction/transaction.module';
import { LedgerModule } from '@modules/ledger/ledger.module';
import { WalletModule } from '@modules/wallet/wallet.module';
import { AuthModule } from '@modules/auth/auth.module';
import { CommonModule } from '@common/common.module';
import { TypeOrmConfigService } from '@config/typeorm.config';
import { AppConfigService } from '@config/app.config';
import { AppConfigModule } from '@config/config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
    AppConfigModule,

    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useExisting: TypeOrmConfigService,
    }),
    AuthModule,
    WalletModule,
    TransactionModule,
    LedgerModule,
    CommonModule,
  ],
})
export class AppModule {}
