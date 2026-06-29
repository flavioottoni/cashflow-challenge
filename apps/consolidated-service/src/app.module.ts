import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from './cache/cache.module';
import { ConsumerModule } from './consumer/consumer.module';
import { DailyBalanceModule } from './daily-balance/daily-balance.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './common/metrics.module';

@Module({
  imports: [
    DatabaseModule,
    CacheModule,
    MetricsModule,
    HealthModule,
    ConsumerModule,
    DailyBalanceModule,
  ],
})
export class AppModule {}
