import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Transactions E2E', () => {
  let app: INestApplication;
  let authToken: string;
  let walletId: string;

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

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'senior.backend', password: 'Password123' })
      .expect(201);

    authToken = loginResponse.body.token;

    const createWalletResponse = await request(app.getHttpServer())
      .post('/api/v1/wallets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ currency: 'USD', status: 'Active', availableBalance: '500.0000' })
      .expect(201);

    walletId = createWalletResponse.body.walletId;
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
        walletId,
        amount: '100.0000',
        currency: 'USD',
      };

      return request(app.getHttpServer())
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`)
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

      return request(app.getHttpServer())
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /wallets/:walletId/balance', () => {
    it('should retrieve wallet balance', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/wallets/${walletId}/balance`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('walletId');
          expect(res.body).toHaveProperty('availableBalance');
          expect(res.body).toHaveProperty('currency');
        });
    });
  });
});
