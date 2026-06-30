import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiCreatedResponse({ description: 'JWT token generated successfully' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
