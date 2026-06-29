import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  EntryCreatedEvent,
  EntryType,
  ENTRY_CREATED_EVENT,
} from '@cashflow/shared';
import { DatabaseService } from '../database/database.service';
import { OutboxPublisherService } from '../messaging/outbox-publisher.service';
import { CreateEntryDto, EntryResponseDto } from './dto/entry.dto';

export interface EntryRecord {
  id: string;
  merchant_id: string;
  date: Date;
  type: EntryType;
  amount: string;
  description: string;
  created_at: Date;
}

@Injectable()
export class EntriesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly outbox: OutboxPublisherService,
  ) {}

  validateEntryDate(dateStr: string): void {
    const entryDate = new Date(dateStr);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (entryDate > today) {
      throw new BadRequestException('Entry date cannot be in the future');
    }
  }

  async create(
    merchantId: string,
    dto: CreateEntryDto,
  ): Promise<EntryResponseDto> {
    this.validateEntryDate(dto.date);
    const id = uuidv4();
    const client = await this.db.getPool().connect();

    try {
      await client.query('BEGIN');

      const result = await client.query<EntryRecord>(
        `INSERT INTO ledger.entries (id, merchant_id, date, type, amount, description)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [id, merchantId, dto.date, dto.type, dto.amount, dto.description],
      );

      const entry = result.rows[0];
      const event: EntryCreatedEvent = {
        eventId: uuidv4(),
        entryId: entry.id,
        merchantId: entry.merchant_id,
        date: dto.date,
        type: entry.type,
        amount: Number(entry.amount),
        description: entry.description,
        createdAt: entry.created_at.toISOString(),
      };

      await this.outbox.saveOutboxEvent(client, entry.id, event);
      await client.query('COMMIT');

      return this.toResponse(entry);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findAll(
    merchantId: string,
    date?: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: EntryResponseDto[]; total: number }> {
    const offset = (page - 1) * limit;
    const params: unknown[] = [merchantId];
    let dateFilter = '';

    if (date) {
      params.push(date);
      dateFilter = ` AND date = $${params.length}`;
    }

    const countResult = await this.db.getPool().query(
      `SELECT COUNT(*) FROM ledger.entries WHERE merchant_id = $1${dateFilter}`,
      params,
    );

    params.push(limit, offset);
    const result = await this.db.getPool().query<EntryRecord>(
      `SELECT * FROM ledger.entries
       WHERE merchant_id = $1${dateFilter}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );

    return {
      data: result.rows.map((r) => this.toResponse(r)),
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async findOne(merchantId: string, id: string): Promise<EntryResponseDto> {
    const result = await this.db.getPool().query<EntryRecord>(
      `SELECT * FROM ledger.entries WHERE id = $1 AND merchant_id = $2`,
      [id, merchantId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Entry ${id} not found`);
    }

    return this.toResponse(result.rows[0]);
  }

  private toResponse(entry: EntryRecord): EntryResponseDto {
    return {
      id: entry.id,
      merchantId: entry.merchant_id,
      date: entry.date instanceof Date
        ? entry.date.toISOString().split('T')[0]
        : String(entry.date),
      type: entry.type,
      amount: Number(entry.amount),
      description: entry.description,
      createdAt: entry.created_at.toISOString(),
    };
  }
}
