import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';
import { DatabaseService } from './database.service';

@Global()
@Module({
  providers: [
    {
      provide: 'PG_POOL',
      useFactory: () =>
        new Pool({
          connectionString:
            process.env.DATABASE_URL ||
            'postgresql://cashflow:cashflow@localhost:5432/cashflow',
          max: 20,
        }),
    },
    DatabaseService,
  ],
  exports: ['PG_POOL', DatabaseService],
})
export class DatabaseModule {}
