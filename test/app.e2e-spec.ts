import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Transactions E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
        });
    });
  });

  describe('POST /transactions', () => {
    it('should create a transaction', () => {
      const createTransactionDto = {
        type: 'DEBIT',
        walletId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 100,
        currency: 'USD',
      };

      return request(app.getHttpServer())
        .post('/api/v1/transactions')
        .send(createTransactionDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.type).toBe('DEBIT');
        });
    });

    it('should validate required fields', () => {
      const invalidDto = {
        type: 'INVALID',
      };

      return request(app.getHttpServer()).post('/api/v1/transactions').send(invalidDto).expect(400);
    });
  });

  describe('GET /wallets/:walletId/balance', () => {
    it('should retrieve wallet balance', () => {
      const walletId = '123e4567-e89b-12d3-a456-426614174000';

      return request(app.getHttpServer())
        .get(`/api/v1/wallets/${walletId}/balance`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('walletId');
          expect(res.body).toHaveProperty('balance');
          expect(res.body).toHaveProperty('currency');
        });
    });
  });
});
