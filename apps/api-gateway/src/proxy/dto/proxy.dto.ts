import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, IsDateString, MaxLength } from 'class-validator';

enum EntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export class CreateEntryProxyDto {
  @ApiProperty({ enum: EntryType })
  @IsEnum(EntryType)
  type!: EntryType;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description!: string;

  @ApiProperty()
  @IsDateString()
  date!: string;
}
