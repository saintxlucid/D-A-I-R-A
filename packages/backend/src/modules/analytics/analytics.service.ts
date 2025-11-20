import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '@/lib/prisma.service'

interface CreatorStats {
  totalViews: number
  totalLikes: number
  totalComments: number
  averageEngagement: number
  followers: number
  revenue: number
}

interface VideoAnalytics {
  videoId: string
  title: string
  views: number
  likes: number
  comments: number
  shares: number
  avgWatchTime: number
  completionRate: number
  engagementRate: number
}

interface PlatformStats {
  totalUsers: number
  activeUsers24h: number
  totalVideos: number
  totalViews: number
  avgEngagement: number
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name)

  constructor(private prisma: PrismaService) {}

  /**
   * Get creator dashboard stats
   */
  async getCreatorStats(creatorId: string): Promise<CreatorStats> {
    const [videos, followers, transactions] = await Promise.all([
      this.prisma.video.findMany({
        where: { authorId: creatorId },
        include: {
          reactions: true,
          comments: true,
        },
      }),
      this.prisma.follow.count({
        where: { followingId: creatorId },
      }),
      this.prisma.transaction.findMany({
        where: { userId: creatorId, type: 'CREATOR_FUND' },
      }),
    ])

    const totalViews = videos.reduce((sum, v) => sum + (v.viewCount || 0), 0)
    const totalLikes = videos.reduce((sum, v) => sum + v.reactions.length, 0)
    const totalComments = videos.reduce((sum, v) => sum + v.comments.length, 0)
    const revenue = transactions.reduce((sum, t) => sum + t.amount, 0)

    return {
      totalViews,
      totalLikes,
      totalComments,
      averageEngagement: totalViews > 0 ? (totalLikes + totalComments) / totalViews : 0,
      followers,
      revenue,
    }
  }

  /**
   * Get video analytics
   */
  async getVideoAnalytics(videoId: string): Promise<VideoAnalytics> {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: {
        reactions: true,
        comments: true,
        author: true,
      },
    })

    if (!video) {
      throw new Error(`Video ${videoId} not found`)
    }

    const engagementRate = video.viewCount > 0 ? (video.reactions.length + video.comments.length) / video.viewCount : 0

    return {
      videoId: video.id,
      title: video.title,
      views: video.viewCount || 0,
      likes: video.reactions.length,
      comments: video.comments.length,
      shares: video.shareCount || 0,
      avgWatchTime: video.avgWatchTime || 0,
      completionRate: video.completionRate || 0,
      engagementRate,
    }
  }

  /**
   * Get platform-wide statistics
   */
  async getPlatformStats(): Promise<PlatformStats> {
    const [totalUsers, totalVideos, totalReactions, totalComments] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.video.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.reaction.count(),
      this.prisma.comment.count(),
    ])

    const totalViews = await this.prisma.video.aggregate({
      _sum: { viewCount: true },
      where: { status: 'PUBLISHED' },
    })

    // Active users in last 24h (simplified)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const activeUsers24h = await this.prisma.user.count({
      where: {
        updatedAt: { gte: oneDayAgo },
      },
    })

    return {
      totalUsers,
      activeUsers24h,
      totalVideos,
      totalViews: totalViews._sum.viewCount || 0,
      avgEngagement: totalViews._sum.viewCount ? (totalReactions + totalComments) / totalViews._sum.viewCount : 0,
    }
  }

  /**
   * Get trending videos
   */
  async getTrendingVideos(timeWindow: string = '24h', limit: number = 20): Promise<VideoAnalytics[]> {
    const hours = this.parseTimeWindow(timeWindow)
    const since = new Date(Date.now() - hours * 60 * 60 * 1000)

    const videos = await this.prisma.video.findMany({
      where: {
        status: 'PUBLISHED',
        createdAt: { gte: since },
      },
      include: {
        reactions: true,
        comments: true,
      },
      orderBy: [{ reactions: { _count: 'desc' } }, { viewCount: 'desc' }],
      take: limit,
    })

    return videos.map((v) => ({
      videoId: v.id,
      title: v.title,
      views: v.viewCount || 0,
      likes: v.reactions.length,
      comments: v.comments.length,
      shares: v.shareCount || 0,
      avgWatchTime: v.avgWatchTime || 0,
      completionRate: v.completionRate || 0,
      engagementRate: v.viewCount ? (v.reactions.length + v.comments.length) / v.viewCount : 0,
    }))
  }

  /**
   * Get user engagement trends over time
   */
  async getEngagementTrends(userId: string, days: number = 30): Promise<any[]> {
    const data: any[] = []

    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000)

      const posts = await this.prisma.post.count({
        where: {
          authorId: userId,
          createdAt: { gte: date, lt: nextDate },
        },
      })

      const reactions = await this.prisma.reaction.count({
        where: {
          user: { id: userId },
          createdAt: { gte: date, lt: nextDate },
        },
      })

      data.push({
        date: date.toISOString().split('T')[0],
        posts,
        reactions,
      })
    }

    return data
  }

  /**
   * Calculate content performance score
   */
  async calculatePerformanceScore(videoId: string): Promise<number> {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: {
        reactions: true,
        comments: true,
      },
    })

    if (!video || video.viewCount === 0) return 0

    const engagementRate = (video.reactions.length + video.comments.length) / video.viewCount
    const completionBonus = (video.completionRate || 0) / 100
    const shareBonus = (video.shareCount || 0) * 0.01

    // Score: 0-100
    return Math.min(100, (engagementRate * 100 + completionBonus * 20 + shareBonus * 10) / 1.3)
  }

  /**
   * Get creator monetization stats
   */
  async getCreatorMonetization(creatorId: string): Promise<any> {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId: creatorId },
    })

    const tips = await this.prisma.tip.findMany({
      where: { recipientId: creatorId },
    })

    const subscriptions = await this.prisma.creatorSubscription.findMany({
      where: { creatorId },
    })

    const totalEarnings = transactions.reduce((sum, t) => sum + t.amount, 0)
    const tipEarnings = tips.reduce((sum, t) => sum + t.amount, 0)
    const activeSubscriptions = subscriptions.filter((s) => s.status === 'ACTIVE').length

    return {
      totalEarnings,
      tipEarnings,
      activeSubscriptions,
      transactions: transactions.length,
      breakdown: {
        adRevenue: transactions.filter((t) => t.type === 'AD_REVENUE').reduce((s, t) => s + t.amount, 0),
        subscriptions: transactions.filter((t) => t.type === 'SUBSCRIPTION').reduce((s, t) => s + t.amount, 0),
        creatorFund: transactions.filter((t) => t.type === 'CREATOR_FUND').reduce((s, t) => s + t.amount, 0),
      },
    }
  }

  /**
   * Scheduled job: Refresh analytics cache daily
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async refreshAnalyticsCache() {
    this.logger.log('Refreshing analytics cache...')

    try {
      const platformStats = await this.getPlatformStats()
      // Cache in Redis (simplified)
      this.logger.log('Analytics cache refreshed:', platformStats)
    } catch (error) {
      this.logger.error('Failed to refresh analytics cache:', error)
    }
  }

  private parseTimeWindow(timeWindow: string): number {
    const match = timeWindow.match(/(\d+)([hmd])/)
    if (!match) return 24

    const value = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case 'h':
        return value
      case 'd':
        return value * 24
      case 'm':
        return value * 24 * 30
      default:
        return 24
    }
  }
}
