import {
  Entity,
  PrimaryColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Index('idx_idempotency_key', ['key'])
@Entity('idempotency_keys')
export class IdempotencyKey {
  @PrimaryColumn('varchar', { length: 255 })
  key!: string;

  @Column('varchar', { length: 64 })
  requestHash!: string;

  @Column('jsonb')
  response!: Record<string, unknown>;

  @Column('integer')
  statusCode!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @Column('timestamp')
  expiresAt!: Date;
}
