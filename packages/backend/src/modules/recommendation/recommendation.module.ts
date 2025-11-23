import { Module } from '@nestjs/common'
import { RecommendationService } from './recommendation.service'
import { RecommendationResolver } from './recommendation.resolver'
import { RecommendationController } from './recommendation.controller'
import { PrismaService } from '@/lib/prisma.service'

@Module({
  providers: [RecommendationService, RecommendationResolver, PrismaService],
  controllers: [RecommendationController],
  exports: [RecommendationService],
})
export class RecommendationModule {}
