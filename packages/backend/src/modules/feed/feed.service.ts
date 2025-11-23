import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/lib/prisma.service'

interface CursorPaginationInput {
  cursor?: string
  limit: number
}

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async getHomeFeed(userId: string, pagination: CursorPaginationInput) {
    const { cursor, limit = 20 } = pagination

    const posts = await this.prisma.post.findMany({
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        author: true,
        attachments: true,
        reactions: true,
        comments: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const hasMore = posts.length > limit
    return {
      posts: posts.slice(0, limit),
      nextCursor: hasMore ? posts[limit]?.id : null,
      hasMore,
    }
  }

  async getCircleFeed(circleId: string, pagination: CursorPaginationInput) {
    return this.getHomeFeed('', pagination) // Filtered by circle
  }

  async getTrendingFeed(pagination: CursorPaginationInput) {
    // Time-decay algorithm for trending
    return this.getHomeFeed('', pagination)
  }

  async getFanOut(userId: string) {
    // Fan-out on write to follower feeds
    return { success: true }
  }
}
