import { Injectable, Logger } from '@nestjs/common';
import {
  EntryCreatedEvent,
  EntryType,
  calculateBalanceDelta,
  computeBalance,
  ENTRY_CREATED_EVENT,
  ENTRY_EXCHANGE,
  ENTRY_QUEUE,
} from '@cashflow/shared';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { DatabaseService } from '../database/database.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class EntryConsumerService {
  private readonly logger = new Logger(EntryConsumerService.name);
  private connection = amqp.connect([
    process.env.RABBITMQ_URL || 'amqp://cashflow:cashflow@localhost:5672',
  ]);
  private channelWrapper: ChannelWrapper;

  constructor(
    private readonly db: DatabaseService,
    private readonly cache: CacheService,
  ) {
    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: async (channel: ConfirmChannel) => {
        await channel.assertExchange(ENTRY_EXCHANGE, 'topic', { durable: true });
        await channel.assertQueue(ENTRY_QUEUE, {
          durable: true,
          arguments: { 'x-dead-letter-exchange': `${ENTRY_EXCHANGE}.dlx` },
        });
        await channel.bindQueue(ENTRY_QUEUE, ENTRY_EXCHANGE, ENTRY_CREATED_EVENT);
        await channel.prefetch(10);
        await channel.consume(ENTRY_QUEUE, async (msg: ConsumeMessage | null) => {
          if (!msg) return;
          try {
            const event = JSON.parse(msg.content.toString()) as EntryCreatedEvent;
            await this.processEntryCreated(event);
            channel.ack(msg);
          } catch (error) {
            this.logger.error('Failed to process entry event', error);
            channel.nack(msg, false, false);
          }
        });
        this.logger.log('Consumer started for entry.created events');
      },
    });
  }

  async processEntryCreated(event: EntryCreatedEvent): Promise<void> {
    const { creditDelta, debitDelta } = calculateBalanceDelta(
      event.type as EntryType,
      event.amount,
    );

    const client = await this.db.getPool().connect();
    try {
      await client.query('BEGIN');

      const upsertResult = await client.query(
        `INSERT INTO reporting.daily_balances
           (merchant_id, date, total_credits, total_debits, balance, last_updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (merchant_id, date) DO UPDATE SET
           total_credits = reporting.daily_balances.total_credits + EXCLUDED.total_credits,
           total_debits = reporting.daily_balances.total_debits + EXCLUDED.total_debits,
           balance = reporting.daily_balances.total_credits + EXCLUDED.total_credits
                     - (reporting.daily_balances.total_debits + EXCLUDED.total_debits),
           last_updated_at = NOW()
         RETURNING *`,
        [
          event.merchantId,
          event.date,
          creditDelta,
          debitDelta,
          creditDelta - debitDelta,
        ],
      );

      await client.query('COMMIT');

      const row = upsertResult.rows[0];
      await this.cache.invalidate(event.merchantId, event.date);
      await this.cache.set(event.merchantId, event.date, {
        date: event.date,
        merchantId: event.merchantId,
        totalCredits: Number(row.total_credits),
        totalDebits: Number(row.total_debits),
        balance: Number(row.balance),
        computedAt: row.last_updated_at.toISOString(),
      });

      this.logger.debug(
        `Updated balance for ${event.merchantId} on ${event.date}: ${row.balance}`,
      );
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
