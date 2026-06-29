import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import axios from 'axios';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Gateway liveness' })
  health() {
    return { status: 'ok', service: 'api-gateway' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Gateway readiness' })
  async ready() {
    const entriesUrl = process.env.ENTRIES_SERVICE_URL || 'http://localhost:3001';
    const consolidatedUrl =
      process.env.CONSOLIDATED_SERVICE_URL || 'http://localhost:3002';

    const checks: Record<string, string> = {
      entries: 'unknown',
      consolidated: 'unknown',
    };

    try {
      await axios.get(`${entriesUrl}/health`, { timeout: 3000 });
      checks.entries = 'up';
    } catch {
      checks.entries = 'down';
    }

    try {
      await axios.get(`${consolidatedUrl}/health`, { timeout: 3000 });
      checks.consolidated = 'up';
    } catch {
      checks.consolidated = 'down';
    }

    const entriesUp = checks.entries === 'up';
    return {
      status: entriesUp ? 'ready' : 'degraded',
      checks,
      note: 'Gateway remains available for entries even if consolidated is down',
    };
  }
}
