import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EntriesModule } from './entries/entries.module';
import { DatabaseModule } from './database/database.module';
import { MessagingModule } from './messaging/messaging.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './common/metrics.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    MessagingModule,
    MetricsModule,
    HealthModule,
    EntriesModule,
  ],
})
export class AppModule {}
