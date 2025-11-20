import { Module } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
import { AnalyticsController } from './analytics.controller'
import { PrismaService } from '@/lib/prisma.service'

@Module({
  providers: [AnalyticsService, PrismaService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
