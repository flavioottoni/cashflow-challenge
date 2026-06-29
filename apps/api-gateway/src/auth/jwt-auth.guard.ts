import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtPayload, SCOPES } from '@cashflow/shared';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.slice(7);
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

@Injectable()
export class EntriesWriteGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    return this.checkScope(context, SCOPES.ENTRIES_WRITE);
  }

  private checkScope(context: ExecutionContext, scope: string): boolean {
    const request = context.switchToHttp().getRequest();
    const payload = request.user as JwtPayload;
    if (!this.authService.validateScopes(payload, scope)) {
      throw new ForbiddenException(`Missing required scope: ${scope}`);
    }
    return true;
  }
}

@Injectable()
export class EntriesReadGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const payload = request.user as JwtPayload;
    if (!this.authService.validateScopes(payload, SCOPES.ENTRIES_READ)) {
      throw new ForbiddenException(`Missing required scope: ${SCOPES.ENTRIES_READ}`);
    }
    return true;
  }
}

@Injectable()
export class BalanceReadGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const payload = request.user as JwtPayload;
    if (!this.authService.validateScopes(payload, SCOPES.BALANCE_READ)) {
      throw new ForbiddenException(`Missing required scope: ${SCOPES.BALANCE_READ}`);
    }
    return true;
  }
}
