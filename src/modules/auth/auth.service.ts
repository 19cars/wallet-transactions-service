import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly validUsername = 'senior.backend';
  private readonly validPassword = 'Password123';
  private readonly token = 'mock-jwt-token';
  private readonly expiresIn = 3600;

  login(dto: LoginDto) {
    if (dto.username !== this.validUsername || dto.password !== this.validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      token: this.token,
      expiresIn: this.expiresIn,
    };
  }
}
