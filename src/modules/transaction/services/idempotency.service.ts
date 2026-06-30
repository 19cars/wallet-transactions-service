import {
  Injectable,
  Logger,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { IdempotencyKey } from '../entities/idempotency-key.entity';

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);
  private readonly ttlHours = 24;

  constructor(
    @InjectRepository(IdempotencyKey)
    private readonly idempotencyRepository: Repository<IdempotencyKey>,
  ) {}

  async checkIdempotency(
    key: string,
    body: Record<string, unknown>,
  ): Promise<{
    cached: boolean;
    response?: Record<string, unknown>;
    statusCode?: number;
  }> {
    const requestHash = this.generateRequestHash(body);

    const existing = await this.idempotencyRepository.findOne({
      where: { key },
    });

    if (existing) {
      if (existing.requestHash !== requestHash) {
        this.logger.warn(`Idempotency key mismatch for key: ${key}`);
        throw new ConflictException(
          'Idempotency key used with different request body',
        );
      }

      if (new Date() > existing.expiresAt) {
        await this.idempotencyRepository.remove(existing);
        return { cached: false };
      }

      return {
        cached: true,
        response: existing.response,
        statusCode: existing.statusCode,
      };
    }

    return { cached: false };
  }

  async storeIdempotency(
    key: string,
    body: Record<string, unknown>,
    response: Record<string, unknown>,
    statusCode: number,
  ): Promise<void> {
    const requestHash = this.generateRequestHash(body);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.ttlHours);

    const idempotencyKey = this.idempotencyRepository.create({
      key,
      requestHash,
      response,
      statusCode,
      expiresAt,
    });

    try {
      await this.idempotencyRepository.save(idempotencyKey);
    } catch (error) {
      this.logger.error(`Failed to store idempotency key: ${error}`);
    }
  }

  private generateRequestHash(body: Record<string, unknown>): string {
    const canonical = JSON.stringify(body, Object.keys(body).sort());
    return crypto.createHash('sha256').update(canonical).digest('hex');
  }
}
