import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { EntriesService } from './entries.service';
import {
  CreateEntryDto,
  EntryResponseDto,
  ListEntriesQueryDto,
} from './dto/entry.dto';

@ApiTags('entries')
@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar lançamento (débito ou crédito)' })
  @ApiHeader({ name: 'x-merchant-id', required: true })
  async create(
    @Headers('x-merchant-id') merchantId: string,
    @Body() dto: CreateEntryDto,
  ): Promise<EntryResponseDto> {
    return this.entriesService.create(merchantId || 'default-merchant', dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar lançamentos' })
  @ApiHeader({ name: 'x-merchant-id', required: true })
  async findAll(
    @Headers('x-merchant-id') merchantId: string,
    @Query() query: ListEntriesQueryDto,
  ) {
    return this.entriesService.findAll(
      merchantId || 'default-merchant',
      query.date,
      query.page || 1,
      query.limit || 20,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter lançamento por ID' })
  @ApiHeader({ name: 'x-merchant-id', required: true })
  async findOne(
    @Headers('x-merchant-id') merchantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EntryResponseDto> {
    return this.entriesService.findOne(merchantId || 'default-merchant', id);
  }
}
