import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  JwtAuthGuard,
  EntriesWriteGuard,
  EntriesReadGuard,
  BalanceReadGuard,
} from './jwt-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    EntriesWriteGuard,
    EntriesReadGuard,
    BalanceReadGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    EntriesWriteGuard,
    EntriesReadGuard,
    BalanceReadGuard,
  ],
})
export class AuthModule {}
