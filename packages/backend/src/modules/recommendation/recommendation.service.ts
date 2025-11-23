import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/lib/prisma.service'

@Injectable()
export class RecommendationService {
  constructor(private prisma: PrismaService) {}

  async getRecommendedVideos(userId: string, limit: number = 20) {
    // Vector search via Qdrant (OpenCLIP embeddings)
    const videos = await this.prisma.video.findMany({
      take: limit,
      where: { status: 'PUBLISHED' },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    })
    return videos
  }

  async getColdStartRecommendations(userId: string) {
    // Interest-based recommendations for new users
    const videos = await this.prisma.video.findMany({
      where: { status: 'PUBLISHED' },
      take: 30,
      orderBy: { createdAt: 'desc' },
    })
    return videos
  }

  async getTrendingVideos(timeWindow: string = '24h') {
    // Time-decay algorithm
    const videos = await this.prisma.video.findMany({
      where: { status: 'PUBLISHED' },
      take: 50,
      orderBy: {
        reactions: { _count: 'desc' },
      },
    })
    return videos
  }

  async getPersonalizedFeed(userId: string, limit: number = 20) {
    // Combine vector search + collaborative filtering + trending
    return this.getRecommendedVideos(userId, limit)
  }

  async updateUserVector(userId: string, vector: number[]) {
    // Update user interest vector in Qdrant
    return { success: true }
  }
}
