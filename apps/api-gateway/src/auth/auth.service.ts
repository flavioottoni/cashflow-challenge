import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SCOPES, JwtPayload } from '@cashflow/shared';
import { LoginDto, TokenResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login(dto: LoginDto): TokenResponseDto {
    const scopes = [
      SCOPES.ENTRIES_WRITE,
      SCOPES.ENTRIES_READ,
      SCOPES.BALANCE_READ,
    ];

    const payload: JwtPayload = {
      sub: dto.username,
      merchantId: dto.merchantId,
      scopes,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: '24h',
      scopes,
    };
  }

  validateScopes(payload: JwtPayload, requiredScope: string): boolean {
    return payload.scopes?.includes(requiredScope) ?? false;
  }
}
