import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

export interface CachedDailyBalance {
  date: string;
  merchantId: string;
  totalCredits: number;
  totalDebits: number;
  balance: number;
  computedAt: string;
}

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly redis: Redis;
  private readonly ttlSeconds = 30;
  private hits = 0;
  private misses = 0;

  constructor() {
    this.redis = new Redis(
      process.env.REDIS_URL || 'redis://localhost:6379',
      { maxRetriesPerRequest: 3, lazyConnect: true },
    );
    this.redis.connect().catch((err) => {
      this.logger.warn('Redis connection failed, cache disabled', err.message);
    });
  }

  private cacheKey(merchantId: string, date: string): string {
    return `balance:${merchantId}:${date}`;
  }

  async get(merchantId: string, date: string): Promise<CachedDailyBalance | null> {
    try {
      const raw = await this.redis.get(this.cacheKey(merchantId, date));
      if (raw) {
        this.hits++;
        return JSON.parse(raw);
      }
      this.misses++;
      return null;
    } catch {
      this.misses++;
      return null;
    }
  }

  async set(merchantId: string, date: string, balance: CachedDailyBalance): Promise<void> {
    try {
      await this.redis.setex(
        this.cacheKey(merchantId, date),
        this.ttlSeconds,
        JSON.stringify(balance),
      );
    } catch (err) {
      this.logger.warn('Failed to set cache', err);
    }
  }

  async invalidate(merchantId: string, date: string): Promise<void> {
    try {
      await this.redis.del(this.cacheKey(merchantId, date));
    } catch (err) {
      this.logger.warn('Failed to invalidate cache', err);
    }
  }

  getCacheHitRatio(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
