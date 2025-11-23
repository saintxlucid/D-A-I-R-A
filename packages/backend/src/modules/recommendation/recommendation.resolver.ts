import { Resolver, Query, Args } from '@nestjs/graphql'
import { RecommendationService } from './recommendation.service'

@Resolver('Recommendation')
export class RecommendationResolver {
  constructor(private recommendationService: RecommendationService) {}

  @Query('recommendedVideos')
  async getRecommendedVideos(@Args('userId') userId: string, @Args('limit') limit: number = 20) {
    return this.recommendationService.getRecommendedVideos(userId, limit)
  }

  @Query('trendingVideos')
  async getTrendingVideos(@Args('timeWindow') timeWindow: string = '24h') {
    return this.recommendationService.getTrendingVideos(timeWindow)
  }

  @Query('personalizedFeed')
  async getPersonalizedFeed(@Args('userId') userId: string, @Args('limit') limit: number = 20) {
    return this.recommendationService.getPersonalizedFeed(userId, limit)
  }
}
