import { Processor, Process } from '@nestjs/bull'
import { Job } from 'bull'
import { Logger } from '@nestjs/common'
import { PrismaService } from '@/lib/prisma.service'

@Processor('video-transcoding')
export class VideoTranscodingProcessor {
  private readonly logger = new Logger(VideoTranscodingProcessor.name)

  constructor(private prisma: PrismaService) {}

  @Process()
  async handleTranscoding(job: Job<{ videoId: string; filePath: string }>) {
    const { videoId, filePath } = job.data

    try {
      this.logger.log(`Starting transcoding for video ${videoId}`)

      // Simulate FFmpeg transcoding
      // ffmpeg -i input.mp4 -c:v libx264 -preset fast -c:a aac output.mp4

      // Update video status
      await this.prisma.video.update({
        where: { id: videoId },
        data: {
          status: 'PUBLISHED',
          processedAt: new Date(),
        },
      })

      this.logger.log(`Transcoding completed for video ${videoId}`)
      return { success: true, videoId }
    } catch (error) {
      this.logger.error(`Transcoding failed for ${videoId}:`, error)
      throw error
    }
  }
}
