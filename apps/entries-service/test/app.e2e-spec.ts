import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { OutboxPublisherService } from '../src/messaging/outbox-publisher.service';
import { MessagingService } from '../src/messaging/messaging.service';

describe('Entries Service Resilience (e2e)', () => {
  let app: INestApplication;
  const mockQuery = jest.fn();
  const mockConnect = jest.fn();
  const mockRelease = jest.fn();
  const mockClientQuery = jest.fn();
  const mockSaveOutbox = jest.fn();

  beforeAll(async () => {
    mockConnect.mockResolvedValue({
      query: mockClientQuery,
      release: mockRelease,
    });

    mockClientQuery.mockImplementation(async (sql: string) => {
      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
        return { rows: [] };
      }
      if (sql.includes('INSERT INTO ledger.entries')) {
        return {
          rows: [
            {
              id: 'test-uuid',
              merchant_id: 'merchant-001',
              date: new Date('2026-06-29'),
              type: 'CREDIT',
              amount: '100.00',
              description: 'Test sale',
              created_at: new Date(),
            },
          ],
        };
      }
      return { rows: [] };
    });

    mockQuery.mockResolvedValue({ rows: [{ count: '1' }] });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue({
        getPool: () => ({
          query: mockQuery,
          connect: mockConnect,
        }),
      })
      .overrideProvider(OutboxPublisherService)
      .useValue({
        saveOutboxEvent: mockSaveOutbox,
        publishPendingEvents: jest.fn(),
      })
      .overrideProvider(MessagingService)
      .useValue({
        publish: jest.fn(),
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /entries succeeds without consolidated service (outbox only)', async () => {
    const response = await request(app.getHttpServer())
      .post('/entries')
      .set('x-merchant-id', 'merchant-001')
      .send({
        type: 'CREDIT',
        amount: 100,
        description: 'Test sale',
        date: '2026-06-29',
      });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(100);
    expect(mockSaveOutbox).toHaveBeenCalled();
  });

  it('GET /health returns ok independently', async () => {
    const response = await request(app.getHttpServer()).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
