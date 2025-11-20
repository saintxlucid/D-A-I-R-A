import { Controller, Get, Param } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('creator/:creatorId')
  async getCreatorStats(@Param('creatorId') creatorId: string) {
    return this.analyticsService.getCreatorStats(creatorId)
  }

  @Get('video/:videoId')
  async getVideoAnalytics(@Param('videoId') videoId: string) {
    return this.analyticsService.getVideoAnalytics(videoId)
  }

  @Get('platform')
  async getPlatformStats() {
    return this.analyticsService.getPlatformStats()
  }

  @Get('trending/:timeWindow')
  async getTrendingVideos(@Param('timeWindow') timeWindow: string = '24h') {
    return this.analyticsService.getTrendingVideos(timeWindow)
  }

  @Get('creator/:creatorId/monetization')
  async getCreatorMonetization(@Param('creatorId') creatorId: string) {
    return this.analyticsService.getCreatorMonetization(creatorId)
  }

  @Get('creator/:creatorId/engagement-trends')
  async getEngagementTrends(@Param('creatorId') creatorId: string) {
    return this.analyticsService.getEngagementTrends(creatorId, 30)
  }

  @Get('video/:videoId/score')
  async getPerformanceScore(@Param('videoId') videoId: string) {
    return {
      score: await this.analyticsService.calculatePerformanceScore(videoId),
    }
  }
}
