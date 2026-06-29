import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'merchant-001' })
  @IsString()
  @IsNotEmpty()
  merchantId!: string;

  @ApiProperty({ example: 'demo-user' })
  @IsString()
  @IsNotEmpty()
  username!: string;
}

export class TokenResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  tokenType!: string;

  @ApiProperty()
  expiresIn!: string;

  @ApiProperty()
  scopes!: string[];
}
