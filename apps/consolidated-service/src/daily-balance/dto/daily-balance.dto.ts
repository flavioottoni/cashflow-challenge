import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class DailyBalanceQueryDto {
  @ApiProperty({ example: '2026-06-29' })
  @IsDateString()
  date!: string;
}

export class DailyBalanceRangeQueryDto {
  @ApiProperty({ example: '2026-06-01' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-06-30' })
  @IsDateString()
  endDate!: string;
}

export class DailyBalanceResponseDto {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  merchantId!: string;

  @ApiProperty()
  totalCredits!: number;

  @ApiProperty()
  totalDebits!: number;

  @ApiProperty()
  balance!: number;

  @ApiProperty()
  computedAt!: string;

  @ApiPropertyOptional()
  cached?: boolean;
}
