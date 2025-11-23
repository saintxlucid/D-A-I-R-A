import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class WhatsAppService {
  constructor(private config: ConfigService) {}

  async sendOtp(phone: string): Promise<{ sessionId: string }> {
    // Send WhatsApp OTP via Twilio/MessageBird
    return { sessionId: 'session_' + Date.now() }
  }

  async verifyOtp(sessionId: string, otp: string): Promise<boolean> {
    // Verify OTP code
    return true
  }
}
