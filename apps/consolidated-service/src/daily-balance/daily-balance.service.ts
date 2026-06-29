import { Injectable, NotFoundException } from '@nestjs/common';
import { computeBalance } from '@cashflow/shared';
import { DatabaseService } from '../database/database.service';
import { CacheService } from '../cache/cache.service';
import { DailyBalanceResponseDto } from './dto/daily-balance.dto';

interface DailyBalanceRow {
  merchant_id: string;
  date: Date;
  total_credits: string;
  total_debits: string;
  balance: string;
  last_updated_at: Date;
}

@Injectable()
export class DailyBalanceService {
  constructor(
    private readonly db: DatabaseService,
    private readonly cache: CacheService,
  ) {}

  async getDailyBalance(
    merchantId: string,
    date: string,
  ): Promise<DailyBalanceResponseDto> {
    const cached = await this.cache.get(merchantId, date);
    if (cached) {
      return { ...cached, cached: true };
    }

    const result = await this.db.getPool().query<DailyBalanceRow>(
      `SELECT * FROM reporting.daily_balances
       WHERE merchant_id = $1 AND date = $2`,
      [merchantId, date],
    );

    if (result.rows.length === 0) {
      const emptyBalance: DailyBalanceResponseDto = {
        date,
        merchantId,
        totalCredits: 0,
        totalDebits: 0,
        balance: 0,
        computedAt: new Date().toISOString(),
        cached: false,
      };
      await this.cache.set(merchantId, date, emptyBalance);
      return emptyBalance;
    }

    const row = result.rows[0];
    const response: DailyBalanceResponseDto = {
      date: row.date instanceof Date
        ? row.date.toISOString().split('T')[0]
        : String(row.date),
      merchantId: row.merchant_id,
      totalCredits: Number(row.total_credits),
      totalDebits: Number(row.total_debits),
      balance: Number(row.balance),
      computedAt: row.last_updated_at.toISOString(),
      cached: false,
    };

    await this.cache.set(merchantId, date, response);
    return response;
  }

  async getDailyBalanceRange(
    merchantId: string,
    startDate: string,
    endDate: string,
  ): Promise<DailyBalanceResponseDto[]> {
    const result = await this.db.getPool().query<DailyBalanceRow>(
      `SELECT * FROM reporting.daily_balances
       WHERE merchant_id = $1 AND date BETWEEN $2 AND $3
       ORDER BY date ASC`,
      [merchantId, startDate, endDate],
    );

    return result.rows.map((row) => ({
      date: row.date instanceof Date
        ? row.date.toISOString().split('T')[0]
        : String(row.date),
      merchantId: row.merchant_id,
      totalCredits: Number(row.total_credits),
      totalDebits: Number(row.total_debits),
      balance: Number(row.balance),
      computedAt: row.last_updated_at.toISOString(),
    }));
  }
}
