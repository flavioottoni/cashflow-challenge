import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { EntryType } from '@cashflow/shared';

export class CreateEntryDto {
  @ApiProperty({ enum: EntryType, example: EntryType.CREDIT })
  @IsEnum(EntryType)
  type!: EntryType;

  @ApiProperty({ example: 150.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  @ApiProperty({ example: 'Venda balcão #42' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description!: string;

  @ApiProperty({ example: '2026-06-29' })
  @IsDateString()
  date!: string;
}

export class EntryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  merchantId!: string;

  @ApiProperty()
  date!: string;

  @ApiProperty({ enum: EntryType })
  type!: EntryType;

  @ApiProperty()
  amount!: number;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  createdAt!: string;
}

export class ListEntriesQueryDto {
  @ApiPropertyOptional({ example: '2026-06-29' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number;
}
