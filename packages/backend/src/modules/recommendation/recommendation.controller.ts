import { Controller, Get, Param } from '@nestjs/common'
import { RecommendationService } from './recommendation.service'

@Controller('recommendations')
export class RecommendationController {
  constructor(private recommendationService: RecommendationService) {}

  @Get('users/:userId/recommended')
  async getRecommendedVideos(@Param('userId') userId: string) {
    return this.recommendationService.getRecommendedVideos(userId)
  }

  @Get('users/:userId/cold-start')
  async getColdStartRecommendations(@Param('userId') userId: string) {
    return this.recommendationService.getColdStartRecommendations(userId)
  }

  @Get('trending')
  async getTrendingVideos() {
    return this.recommendationService.getTrendingVideos('24h')
  }

  @Get('users/:userId/personalized')
  async getPersonalizedFeed(@Param('userId') userId: string) {
    return this.recommendationService.getPersonalizedFeed(userId)
  }
}
