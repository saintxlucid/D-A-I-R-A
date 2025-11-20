import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { PrismaService } from '@/lib/prisma.service'

/**
 * Vector Embeddings Service
 * Integrates OpenCLIP for video/image embeddings
 * Stores in Qdrant for fast similarity search
 */
@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name)
  private qdrantClient: any
  private openclipEndpoint: string

  constructor(private config: ConfigService, private prisma: PrismaService) {
    this.openclipEndpoint = config.get('OPENCLIP_ENDPOINT') || 'http://localhost:8000'
    this.initializeQdrant()
  }

  private async initializeQdrant() {
    try {
      const qdrantUrl = this.config.get('QDRANT_URL') || 'http://localhost:6333'
      // Initialize Qdrant client
      this.logger.log(`Connecting to Qdrant at ${qdrantUrl}`)
    } catch (error) {
      this.logger.error('Failed to initialize Qdrant:', error)
    }
  }

  /**
   * Generate video embeddings using OpenCLIP
   * Processes keyframes from video
   */
  async generateVideoEmbeddings(videoId: string, videoPath: string): Promise<number[]> {
    try {
      this.logger.log(`Generating embeddings for video ${videoId}`)

      // Call OpenCLIP service to generate embeddings
      const response = await axios.post(`${this.openclipEndpoint}/embed/video`, {
        video_path: videoPath,
        model: 'ViT-B-32', // OpenCLIP model
        batch_size: 32,
      })

      const embedding = response.data.embedding
      this.logger.log(`Generated embedding (${embedding.length} dims) for video ${videoId}`)

      // Store embedding in database
      await this.prisma.video.update({
        where: { id: videoId },
        data: {
          embeddings: embedding,
        },
      })

      return embedding
    } catch (error) {
      this.logger.error(`Failed to generate embeddings for ${videoId}:`, error)
      throw error
    }
  }

  /**
   * Generate text embeddings for search/tagging
   */
  async generateTextEmbeddings(text: string): Promise<number[]> {
    try {
      const response = await axios.post(`${this.openclipEndpoint}/embed/text`, {
        text,
        model: 'ViT-B-32',
      })

      return response.data.embedding
    } catch (error) {
      this.logger.error('Failed to generate text embedding:', error)
      throw error
    }
  }

  /**
   * Search similar videos using Qdrant
   */
  async searchSimilarVideos(queryEmbedding: number[], limit: number = 20): Promise<string[]> {
    try {
      // Query Qdrant for similar vectors
      const response = await axios.post(
        `${this.config.get('QDRANT_URL')}/collections/videos/points/search`,
        {
          vector: queryEmbedding,
          limit,
          with_payload: true,
          score_threshold: 0.7,
        }
      )

      const videoIds = response.data.result.map((r: any) => r.payload.video_id)
      this.logger.log(`Found ${videoIds.length} similar videos`)

      return videoIds
    } catch (error) {
      this.logger.error('Failed to search similar videos:', error)
      return []
    }
  }

  /**
   * Get personalized recommendations based on user's viewed videos
   */
  async getPersonalizedRecommendations(userId: string, limit: number = 30): Promise<string[]> {
    try {
      // Get user's viewed videos
      const viewedVideos = await this.prisma.video.findMany({
        where: {
          views: {
            some: { userId },
          },
        },
        select: { embeddings: true },
        take: 10,
      })

      if (viewedVideos.length === 0) {
        return this.getColdStartRecommendations(limit)
      }

      // Average embeddings from viewed videos
      const avgEmbedding = this.averageEmbeddings(
        viewedVideos.map((v) => v.embeddings).filter((e) => e !== null) as number[][]
      )

      // Search for similar videos
      return this.searchSimilarVideos(avgEmbedding, limit)
    } catch (error) {
      this.logger.error('Failed to get personalized recommendations:', error)
      return this.getColdStartRecommendations(limit)
    }
  }

  /**
   * Cold-start recommendations for new users
   */
  async getColdStartRecommendations(limit: number = 30): Promise<string[]> {
    const videos = await this.prisma.video.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return videos.map((v) => v.id)
  }

  /**
   * Cluster similar videos for discovery
   */
  async clusterVideos(limit: number = 100): Promise<Map<string, string[]>> {
    try {
      const videos = await this.prisma.video.findMany({
        where: { status: 'PUBLISHED', embeddings: { not: null } },
        select: { id: true, embeddings: true },
        take: limit,
      })

      const clusters = new Map<string, string[]>()

      // Simple clustering: group by embedding similarity
      for (let i = 0; i < videos.length; i++) {
        if (!videos[i].embeddings) continue

        let found = false
        for (const [clusterId, members] of clusters.entries()) {
          const similarity = this.cosineSimilarity(
            videos[i].embeddings as number[],
            (videos.find((v) => v.id === members[0])?.embeddings || []) as number[]
          )

          if (similarity > 0.8) {
            members.push(videos[i].id)
            found = true
            break
          }
        }

        if (!found) {
          clusters.set(`cluster_${Date.now()}_${i}`, [videos[i].id])
        }
      }

      return clusters
    } catch (error) {
      this.logger.error('Failed to cluster videos:', error)
      return new Map()
    }
  }

  /**
   * Helper: Average multiple embeddings
   */
  private averageEmbeddings(embeddings: number[][]): number[] {
    if (embeddings.length === 0) return []

    const dim = embeddings[0].length
    const avg = new Array(dim).fill(0)

    for (const embedding of embeddings) {
      for (let i = 0; i < dim; i++) {
        avg[i] += embedding[i]
      }
    }

    return avg.map((val) => val / embeddings.length)
  }

  /**
   * Helper: Cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }
}
