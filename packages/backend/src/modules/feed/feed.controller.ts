import { Controller, Get, Query, Param } from '@nestjs/common'
import { FeedService } from './feed.service'

@Controller('feeds')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Get('home')
  async getHomeFeed(@Query('userId') userId: string, @Query('cursor') cursor?: string) {
    return this.feedService.getHomeFeed(userId, { cursor, limit: 20 })
  }

  @Get('circle/:circleId')
  async getCircleFeed(@Param('circleId') circleId: string, @Query('cursor') cursor?: string) {
    return this.feedService.getCircleFeed(circleId, { cursor, limit: 20 })
  }

  @Get('trending')
  async getTrendingFeed(@Query('cursor') cursor?: string) {
    return this.feedService.getTrendingFeed({ cursor, limit: 20 })
  }
}
