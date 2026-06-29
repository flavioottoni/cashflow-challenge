import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { ENTRY_EXCHANGE } from '@cashflow/shared';

@Injectable()
export class MessagingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MessagingService.name);
  private connection = amqp.connect([
    process.env.RABBITMQ_URL || 'amqp://cashflow:cashflow@localhost:5672',
  ]);
  private channelWrapper: ChannelWrapper = this.connection.createChannel({
    json: true,
    setup: async (channel: ConfirmChannel) => {
      await channel.assertExchange(ENTRY_EXCHANGE, 'topic', { durable: true });
    },
  });

  async onModuleInit() {
    await this.channelWrapper.waitForConnect();
    this.logger.log('Connected to RabbitMQ');
  }

  async publish(routingKey: string, message: unknown): Promise<void> {
    await this.channelWrapper.publish(ENTRY_EXCHANGE, routingKey, message, {
      persistent: true,
      contentType: 'application/json',
    });
  }

  async onModuleDestroy() {
    await this.channelWrapper.close();
    await this.connection.close();
  }
}
