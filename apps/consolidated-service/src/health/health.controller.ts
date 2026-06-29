import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { MetricsService } from '../common/metrics.service';
import { CacheService } from '../cache/cache.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    @Inject('PG_POOL') private readonly pool: Pool,
    private readonly metrics: MetricsService,
    private readonly cache: CacheService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Liveness probe' })
  health() {
    return {
      status: 'ok',
      service: process.env.SERVICE_NAME || 'consolidated-service',
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  async ready() {
    try {
      await this.pool.query('SELECT 1');
      return { status: 'ready', database: 'connected' };
    } catch {
      return { status: 'not_ready', database: 'disconnected' };
    }
  }

  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiOperation({ summary: 'Prometheus metrics' })
  async metricsEndpoint() {
    this.metrics.setCacheHitRatio(this.cache.getCacheHitRatio());
    return this.metrics.getMetrics();
  }
}
