import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../database/database.service';
import { MessagingService } from './messaging.service';
import { ENTRY_CREATED_EVENT } from '@cashflow/shared';

@Injectable()
export class OutboxPublisherService {
  private readonly logger = new Logger(OutboxPublisherService.name);
  private isProcessing = false;

  constructor(
    private readonly db: DatabaseService,
    private readonly messaging: MessagingService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async publishPendingEvents(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const client = await this.db.getPool().connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        `SELECT id, event_type, payload FROM ledger.outbox_events
         WHERE published_at IS NULL
         ORDER BY created_at ASC
         LIMIT 50
         FOR UPDATE SKIP LOCKED`,
      );

      for (const row of result.rows) {
        await this.messaging.publish(row.event_type, row.payload);
        await client.query(
          `UPDATE ledger.outbox_events SET published_at = NOW() WHERE id = $1`,
          [row.id],
        );
      }

      await client.query('COMMIT');

      if (result.rows.length > 0) {
        this.logger.debug(`Published ${result.rows.length} outbox events`);
      }
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Failed to publish outbox events', error);
    } finally {
      client.release();
      this.isProcessing = false;
    }
  }

  async saveOutboxEvent(
    client: import('pg').PoolClient,
    aggregateId: string,
    payload: unknown,
  ): Promise<void> {
    const { v4: uuidv4 } = await import('uuid');
    await client.query(
      `INSERT INTO ledger.outbox_events (id, aggregate_id, event_type, payload)
       VALUES ($1, $2, $3, $4)`,
      [uuidv4(), aggregateId, ENTRY_CREATED_EVENT, JSON.stringify(payload)],
    );
  }
}
