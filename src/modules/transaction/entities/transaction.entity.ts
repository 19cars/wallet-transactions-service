import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

@Entity('transactions')
export class Transaction {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('varchar', { length: 20 })
  type!: string;

  @Column('uuid')
  walletId!: string;

  @Column('decimal', { precision: 12, scale: 4, default: '0.0000' })
  amount!: string;

  @Column('varchar', { length: 3 })
  currency!: string;

  @Column('varchar', { length: 20 })
  status!: TransactionStatus;

  @Column('text', { nullable: true })
  description?: string;

  @Column('varchar', { length: 100, nullable: true })
  externalReference?: string;

  @Column('text', { nullable: true })
  metadata?: string;

  @Column('uuid', { nullable: true })
  relatedTransactionId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column('timestamp', { nullable: true })
  completedAt?: Date;
}
