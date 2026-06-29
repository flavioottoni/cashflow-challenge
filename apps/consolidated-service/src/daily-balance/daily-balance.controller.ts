import { Controller, Get, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { DailyBalanceService } from './daily-balance.service';
import {
  DailyBalanceQueryDto,
  DailyBalanceRangeQueryDto,
  DailyBalanceResponseDto,
} from './dto/daily-balance.dto';

@ApiTags('daily-balance')
@Controller('daily-balance')
export class DailyBalanceController {
  constructor(private readonly dailyBalanceService: DailyBalanceService) {}

  @Get()
  @ApiOperation({ summary: 'Obter saldo diário consolidado' })
  @ApiHeader({ name: 'x-merchant-id', required: true })
  async getDailyBalance(
    @Headers('x-merchant-id') merchantId: string,
    @Query() query: DailyBalanceQueryDto,
  ): Promise<DailyBalanceResponseDto> {
    return this.dailyBalanceService.getDailyBalance(
      merchantId || 'default-merchant',
      query.date,
    );
  }

  @Get('range')
  @ApiOperation({ summary: 'Obter saldos em intervalo de datas' })
  @ApiHeader({ name: 'x-merchant-id', required: true })
  async getDailyBalanceRange(
    @Headers('x-merchant-id') merchantId: string,
    @Query() query: DailyBalanceRangeQueryDto,
  ): Promise<DailyBalanceResponseDto[]> {
    return this.dailyBalanceService.getDailyBalanceRange(
      merchantId || 'default-merchant',
      query.startDate,
      query.endDate,
    );
  }
}
