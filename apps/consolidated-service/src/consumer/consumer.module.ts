import { Module } from '@nestjs/common';
import { EntryConsumerService } from './entry-consumer.service';

@Module({
  providers: [EntryConsumerService],
  exports: [EntryConsumerService],
})
export class ConsumerModule {}
