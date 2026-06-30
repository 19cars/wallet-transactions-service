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

  @Column('numeric', { precision: 19, scale: 2 })
  amount!: number;

  @Column('varchar', { length: 3 })
  currency!: string;

  @Column('varchar', { length: 20 })
  status!: TransactionStatus;

  @Column('text', { nullable: true })
  metadata?: string;

  @Column('uuid', { nullable: true })
  relatedTransactionId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column('timestamp', { nullable: true })
  completedAt?: Date;
}
