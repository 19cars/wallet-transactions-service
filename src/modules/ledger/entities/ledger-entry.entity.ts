import { Entity, PrimaryColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Index('idx_wallet_created', ['walletId'])
@Index('idx_wallet_transaction', ['sourceTransactionId'])
@Entity('ledger_entries')
export class LedgerEntry {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  walletId!: string;

  @Column('varchar', { length: 20 })
  type!: string;

  @Column('decimal', { precision: 12, scale: 4, default: '0.0000' })
  debitAmount!: string;

  @Column('decimal', { precision: 12, scale: 4, default: '0.0000' })
  creditAmount!: string;

  @Column('decimal', { precision: 12, scale: 4, default: '0.0000' })
  balance!: string;

  @Column('varchar', { length: 3 })
  currency!: string;

  @Column('varchar', { length: 20 })
  status!: string;

  @Column('uuid')
  sourceTransactionId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
