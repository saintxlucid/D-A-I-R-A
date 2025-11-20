import { Controller, Post, Get, Body, Param, Headers, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator'
import { WebhookService } from './webhook.service'

@Controller('webhooks')
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  /**
   * Register a new webhook endpoint
   */
  @Post('register')
  @UseGuards(JwtAuthGuard)
  async registerWebhook(
    @CurrentUser() user: any,
    @Body() body: { url: string; events: string[] }
  ): Promise<any> {
    return this.webhookService.registerWebhook(user.id, body.url, body.events)
  }

  /**
   * Handle Fawry payment webhook
   * POST /webhooks/fawry
   * Authorization: Fawry signature in header
   */
  @Post('fawry')
  async handleFawryPayment(
    @Body() payload: any,
    @Headers('x-signature') signature: string
  ): Promise<{ status: string }> {
    await this.webhookService.handleFawryWebhook(payload, signature)
    return { status: 'received' }
  }

  /**
   * Handle Vodafone Cash payment webhook
   * POST /webhooks/vodafone
   * Authorization: Vodafone signature in header
   */
  @Post('vodafone')
  async handleVodafonePayment(
    @Body() payload: any,
    @Headers('x-signature') signature: string
  ): Promise<{ status: string }> {
    await this.webhookService.handleVodafoneWebhook(payload, signature)
    return { status: 'received' }
  }

  /**
   * Handle video transcoding completion webhook
   * POST /webhooks/transcoding
   * Called by video processing service when transcoding completes
   */
  @Post('transcoding')
  async handleTranscodingComplete(@Body() payload: any): Promise<{ status: string }> {
    await this.webhookService.handleTranscodingWebhook(payload)
    return { status: 'processed' }
  }

  /**
   * Get webhook delivery history
   * GET /webhooks/:webhookId/history
   */
  @Get(':webhookId/history')
  @UseGuards(JwtAuthGuard)
  async getWebhookHistory(
    @Param('webhookId') webhookId: string,
    @CurrentUser() user: any
  ): Promise<any[]> {
    return this.webhookService.getWebhookHistory(webhookId)
  }

  /**
   * Resend a failed webhook delivery
   * POST /webhooks/:deliveryId/resend
   */
  @Post(':deliveryId/resend')
  @UseGuards(JwtAuthGuard)
  async resendWebhook(
    @Param('deliveryId') deliveryId: string,
    @CurrentUser() user: any
  ): Promise<{ status: string }> {
    await this.webhookService.resendWebhook(deliveryId)
    return { status: 'queued' }
  }

  /**
   * Health check for webhook system
   */
  @Get('health')
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    }
  }
}
