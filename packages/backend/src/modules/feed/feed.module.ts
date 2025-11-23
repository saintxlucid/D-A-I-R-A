import { Module } from '@nestjs/common'
import { FeedService } from './feed.service'
import { FeedResolver } from './feed.resolver'
import { FeedController } from './feed.controller'
import { PrismaService } from '@/lib/prisma.service'

@Module({
  providers: [FeedService, FeedResolver, PrismaService],
  controllers: [FeedController],
  exports: [FeedService],
})
export class FeedModule {}
