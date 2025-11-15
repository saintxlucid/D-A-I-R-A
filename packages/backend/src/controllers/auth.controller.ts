import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { User } from '../types/user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: { email: string; password: string }): Promise<User> {
    return this.authService.signup(body.email, body.password);
  }
}
