import { Module, Global } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { OutboxPublisherService } from './outbox-publisher.service';

@Global()
@Module({
  providers: [MessagingService, OutboxPublisherService],
  exports: [MessagingService, OutboxPublisherService],
})
export class MessagingModule {}
