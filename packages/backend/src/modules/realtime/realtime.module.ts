import { Module } from '@nestjs/common'
import { RealtimeService } from './realtime.service'
import { RealtimeGateway } from './realtime.gateway'
import { PrismaService } from '@/lib/prisma.service'

@Module({
  providers: [RealtimeService, RealtimeGateway, PrismaService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
