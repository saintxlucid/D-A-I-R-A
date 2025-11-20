import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type SignupInput,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from '../dtos/auth.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @UseGuards(RateLimitGuard)
  async signup(
    @Body(new ZodValidationPipe(signupSchema)) dto: SignupInput
  ) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @UseGuards(RateLimitGuard)
  async login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginInput) {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  @UseGuards(RateLimitGuard)
  async forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema)) dto: ForgotPasswordInput
  ) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @UseGuards(RateLimitGuard)
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) dto: ResetPasswordInput
  ) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Post('logout')
  async logout(@Request() req: any) {
    return this.authService.logout(req.user?.id);
  }

  @Post('refresh')
  async refresh(@Request() req: any) {
    return this.authService.refreshToken(req.user?.id);
  }
}
