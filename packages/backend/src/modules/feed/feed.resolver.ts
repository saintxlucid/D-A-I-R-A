import { Resolver, Query, Args } from '@nestjs/graphql'
import { FeedService } from './feed.service'

@Resolver('Feed')
export class FeedResolver {
  constructor(private feedService: FeedService) {}

  @Query('homeFeed')
  async getHomeFeed(@Args('userId') userId: string, @Args('cursor') cursor?: string) {
    return this.feedService.getHomeFeed(userId, { cursor, limit: 20 })
  }

  @Query('trendingFeed')
  async getTrendingFeed(@Args('cursor') cursor?: string) {
    return this.feedService.getTrendingFeed({ cursor, limit: 20 })
  }
}
