import { Module } from '@nestjs/common'
import { ModerationService } from './moderation.service'
import { ModerationResolver } from './moderation.resolver'
import { ModerationController } from './moderation.controller'
import { PrismaService } from '@/lib/prisma.service'

@Module({
  providers: [ModerationService, ModerationResolver, PrismaService],
  controllers: [ModerationController],
  exports: [ModerationService],
})
export class ModerationModule {}
