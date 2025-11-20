import { Module } from '@nestjs/common'
import { WebhookService } from './webhook.service'
import { WebhookController } from './webhook.controller'
import { PrismaService } from '@/lib/prisma.service'

@Module({
  providers: [WebhookService, PrismaService],
  controllers: [WebhookController],
  exports: [WebhookService],
})
export class WebhookModule {}
