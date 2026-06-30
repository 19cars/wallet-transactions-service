import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum WalletStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  walletId!: string;

  @Column('decimal', { precision: 12, scale: 4, default: '0.0000' })
  availableBalance!: string;

  @Column('varchar', { length: 20 })
  status!: WalletStatus;

  @Column('varchar', { length: 3 })
  currency!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
