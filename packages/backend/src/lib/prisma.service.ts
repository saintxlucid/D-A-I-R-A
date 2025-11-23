import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient {
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production')
    }

    const tables = [
      'Message',
      'Comment',
      'Reaction',
      'Post',
      'PostAttachment',
      'Video',
      'Story',
      'CreatorMetrics',
      'CreatorSubscription',
      'Tip',
      'Transaction',
      'PaymentMethod',
      'Wallet',
      'ContentReport',
      'ContentModeration',
      'Follow',
      'CircleMember',
      'Circle',
      'VerificationBadge',
      'AuditLog',
      'Session',
      'Profile',
      'User',
    ]

    for (const table of tables) {
      try {
        await this.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`)
      } catch (error) {
        // Table might not exist
      }
    }
  }
}
