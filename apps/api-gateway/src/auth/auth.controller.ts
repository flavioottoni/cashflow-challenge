import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, TokenResponseDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  @SkipThrottle()
  @ApiOperation({ summary: 'Obter token JWT (dev/demo)' })
  login(@Body() dto: LoginDto): TokenResponseDto {
    return this.authService.login(dto);
  }
}
