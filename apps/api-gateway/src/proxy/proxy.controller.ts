import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  All,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';
import {
  JwtAuthGuard,
  EntriesWriteGuard,
  EntriesReadGuard,
  BalanceReadGuard,
} from '../auth/jwt-auth.guard';
import { JwtPayload } from '@cashflow/shared';
import { CreateEntryProxyDto } from './dto/proxy.dto';

@ApiTags('entries')
@ApiBearerAuth()
@Controller('entries')
export class EntriesProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Post()
  @UseGuards(JwtAuthGuard, EntriesWriteGuard)
  @ApiOperation({ summary: 'Criar lançamento' })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateEntryProxyDto,
  ) {
    const result = await this.proxy.forwardToEntries(
      'POST',
      '/entries',
      req.user as JwtPayload,
      body,
      undefined,
      req.headers['x-correlation-id'] as string,
    );
    return res.status(result.status).json(result.data);
  }

  @Get()
  @UseGuards(JwtAuthGuard, EntriesReadGuard)
  @ApiOperation({ summary: 'Listar lançamentos' })
  async list(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: Record<string, string>,
  ) {
    const result = await this.proxy.forwardToEntries(
      'GET',
      '/entries',
      req.user as JwtPayload,
      undefined,
      query,
      req.headers['x-correlation-id'] as string,
    );
    return res.status(result.status).json(result.data);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, EntriesReadGuard)
  @ApiOperation({ summary: 'Obter lançamento' })
  async getOne(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    const result = await this.proxy.forwardToEntries(
      'GET',
      `/entries/${id}`,
      req.user as JwtPayload,
      undefined,
      undefined,
      req.headers['x-correlation-id'] as string,
    );
    return res.status(result.status).json(result.data);
  }
}

@ApiTags('daily-balance')
@ApiBearerAuth()
@Controller('daily-balance')
export class ConsolidatedProxyController {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  @Throttle({ consolidated: { limit: 55, ttl: 1000 } })
  @UseGuards(JwtAuthGuard, BalanceReadGuard)
  @ApiOperation({ summary: 'Saldo diário consolidado' })
  async getDaily(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: Record<string, string>,
  ) {
    const result = await this.proxy.forwardToConsolidated(
      'GET',
      '/daily-balance',
      req.user as JwtPayload,
      query,
      req.headers['x-correlation-id'] as string,
    );
    return res.status(result.status).json(result.data);
  }

  @Get('range')
  @Throttle({ consolidated: { limit: 55, ttl: 1000 } })
  @UseGuards(JwtAuthGuard, BalanceReadGuard)
  @ApiOperation({ summary: 'Saldos em intervalo' })
  async getRange(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: Record<string, string>,
  ) {
    const result = await this.proxy.forwardToConsolidated(
      'GET',
      '/daily-balance/range',
      req.user as JwtPayload,
      query,
      req.headers['x-correlation-id'] as string,
    );
    return res.status(result.status).json(result.data);
  }
}
