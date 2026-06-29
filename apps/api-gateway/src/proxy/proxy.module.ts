import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProxyService } from './proxy.service';
import {
  EntriesProxyController,
  ConsolidatedProxyController,
} from './proxy.controller';

@Module({
  imports: [AuthModule],
  controllers: [EntriesProxyController, ConsolidatedProxyController],
  providers: [ProxyService],
})
export class ProxyModule {}
