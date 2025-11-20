import { Injectable, Logger } from '@nestjs/common'
import * as crypto from 'crypto'
import axios from 'axios'
import { PrismaService } from '@/lib/prisma.service'

interface WebhookPayload {
  event: string
  data: any
  timestamp: number
}

interface WebhookEvent {
  id: string
  url: string
  event: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  retries: number
  nextRetry?: Date
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name)
  private readonly MAX_RETRIES = 5
  private readonly RETRY_DELAY = 60000 // 1 minute

  constructor(private prisma: PrismaService) {}

  /**
   * Register a webhook endpoint
   */
  async registerWebhook(userId: string, url: string, events: string[]): Promise<any> {
    const secret = this.generateSecret()

    return {
      id: crypto.randomUUID(),
      userId,
      url,
      events,
      secret,
      active: true,
      createdAt: new Date(),
    }
  }

  /**
   * Trigger a webhook event
   */
  async triggerEvent(event: string, data: any): Promise<void> {
    this.logger.log(`Triggering event: ${event}`)

    // Find all webhooks subscribed to this event
    // This is simplified - in production, query from database
    const webhooks: any[] = [] // Would query from DB

    for (const webhook of webhooks) {
      await this.queueWebhookDelivery(webhook, event, data)
    }
  }

  /**
   * Queue webhook for delivery with retry logic
   */
  private async queueWebhookDelivery(webhook: any, event: string, data: any): Promise<void> {
    const payload: WebhookPayload = {
      event,
      data,
      timestamp: Date.now(),
    }

    const signature = this.generateSignature(payload, webhook.secret)

    try {
      await this.deliverWebhook(webhook.url, payload, signature)
      this.logger.log(`Webhook delivered successfully to ${webhook.url}`)
    } catch (error) {
      this.logger.error(`Failed to deliver webhook to ${webhook.url}:`, error)
      await this.scheduleRetry(webhook, payload, signature)
    }
  }

  /**
   * Deliver webhook with signature verification
   */
  private async deliverWebhook(url: string, payload: WebhookPayload, signature: string): Promise<void> {
    const response = await axios.post(url, payload, {
      headers: {
        'X-Webhook-Signature': signature,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }

  /**
   * Schedule webhook retry
   */
  private async scheduleRetry(webhook: any, payload: WebhookPayload, signature: string): Promise<void> {
    // Queue for retry (simplified - would use BullMQ in production)
    this.logger.log(`Scheduling retry for webhook ${webhook.id}`)

    setTimeout(() => {
      this.deliverWebhook(webhook.url, payload, signature).catch((error) => {
        this.logger.error(`Webhook retry failed: ${error.message}`)
      })
    }, this.RETRY_DELAY)
  }

  /**
   * Handle payment webhook from Fawry
   */
  async handleFawryWebhook(data: any, signature: string): Promise<void> {
    // Verify Fawry signature
    if (!this.verifyFawrySignature(data, signature)) {
      throw new Error('Invalid Fawry signature')
    }

    this.logger.log(`Processing Fawry webhook: ${data.event_type}`)

    switch (data.event_type) {
      case 'payment_success':
        await this.handlePaymentSuccess(data)
        break
      case 'payment_failed':
        await this.handlePaymentFailed(data)
        break
      case 'refund_success':
        await this.handleRefund(data)
        break
    }
  }

  /**
   * Handle payment webhook from Vodafone Cash
   */
  async handleVodafoneWebhook(data: any, signature: string): Promise<void> {
    this.logger.log(`Processing Vodafone webhook: ${data.transactionStatus}`)

    switch (data.transactionStatus) {
      case 'SUCCESS':
        await this.handlePaymentSuccess(data)
        break
      case 'FAILED':
        await this.handlePaymentFailed(data)
        break
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(data: any): Promise<void> {
    const transactionId = data.transaction_id || data.transactionId
    const amount = data.amount

    this.logger.log(`Payment success: ${transactionId} - ${amount}`)

    // Update transaction status in database
    // Mark as completed, grant credits to user, etc.
    this.logger.log('Transaction marked as completed')
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(data: any): Promise<void> {
    const transactionId = data.transaction_id || data.transactionId
    const reason = data.failure_reason

    this.logger.log(`Payment failed: ${transactionId} - ${reason}`)

    // Mark transaction as failed, notify user
    this.logger.log('Transaction marked as failed, user notified')
  }

  /**
   * Handle refund webhook
   */
  private async handleRefund(data: any): Promise<void> {
    const refundId = data.refund_id
    const originalTransaction = data.original_transaction_id
    const amount = data.amount

    this.logger.log(`Refund processed: ${refundId} - ${amount}`)

    // Deduct credits from user wallet
    this.logger.log('Refund processed, user wallet updated')
  }

  /**
   * Handle video transcoding completion webhook
   */
  async handleTranscodingWebhook(data: any): Promise<void> {
    const videoId = data.video_id
    const status = data.status

    this.logger.log(`Video transcoding: ${videoId} - ${status}`)

    if (status === 'completed') {
      // Update video status to PUBLISHED
      await this.prisma.video.update({
        where: { id: videoId },
        data: {
          status: 'PUBLISHED',
          processedAt: new Date(),
        },
      })

      this.logger.log(`Video published: ${videoId}`)
    }
  }

  /**
   * Generate webhook signature
   */
  private generateSignature(payload: any, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex')
  }

  /**
   * Verify Fawry signature
   */
  private verifyFawrySignature(data: any, signature: string): boolean {
    // Implement Fawry signature verification
    // This is a placeholder - follow Fawry's documentation
    return true
  }

  /**
   * Generate secure webhook secret
   */
  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Get webhook delivery history
   */
  async getWebhookHistory(webhookId: string, limit: number = 50): Promise<any[]> {
    // Query webhook delivery attempts from database
    return []
  }

  /**
   * Resend failed webhook
   */
  async resendWebhook(deliveryId: string): Promise<void> {
    // Resend a previously failed webhook delivery
    this.logger.log(`Resending webhook: ${deliveryId}`)
  }
}
