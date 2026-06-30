import {
  Entity,
  PrimaryColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

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

  @Column('numeric', { precision: 19, scale: 2 })
  debitAmount!: number;

  @Column('numeric', { precision: 19, scale: 2 })
  creditAmount!: number;

  @Column('numeric', { precision: 19, scale: 2 })
  balance!: number;

  @Column('varchar', { length: 3 })
  currency!: string;

  @Column('uuid')
  sourceTransactionId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
