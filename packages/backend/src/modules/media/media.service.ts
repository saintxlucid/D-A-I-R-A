import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { PrismaService } from '@/lib/prisma';
import * as path from 'path';
import * as fs from 'fs/promises';

interface VideoUploadResult {
  videoId: string;
  tempPath: string;
  size: number;
}

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly uploadDir = process.env.UPLOAD_DIR || '/tmp/uploads';
  private readonly outputDir = process.env.OUTPUT_DIR || '/tmp/videos';

  constructor(
    @InjectQueue('video-transcoding') private transcodingQueue: Queue,
    private prisma: PrismaService
  ) {
    this.ensureDirectories();
  }

  /**
   * Ensure upload and output directories exist
   */
  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.outputDir, { recursive: true });
      this.logger.debug(`Directories ready: ${this.uploadDir}, ${this.outputDir}`);
    } catch (error) {
      this.logger.error('Failed to create directories:', error);
    }
  }

  /**
   * Initiate video upload via tus.io resumable upload
   */
  async initiateVideoUpload(
    userId: string,
    fileName: string,
    fileSize: number
  ): Promise<VideoUploadResult> {
    const videoId = this.generateVideoId();
    const tempPath = path.join(this.uploadDir, videoId, fileName);

    // Create directory for this upload
    await fs.mkdir(path.dirname(tempPath), { recursive: true });

    // Store metadata in database
    await this.prisma.video.create({
      data: {
        id: videoId,
        authorId: userId,
        fileName,
        fileSize,
        status: 'UPLOADING',
        tempPath,
      },
    });

    this.logger.debug(`Video upload initiated: ${videoId} (${fileSize} bytes)`);

    return { videoId, tempPath, size: fileSize };
  }

  /**
   * Handle completed upload and queue for transcoding
   */
  async completeVideoUpload(videoId: string): Promise<void> {
    // Update video status
    const video = await this.prisma.video.update({
      where: { id: videoId },
      data: { status: 'QUEUED_FOR_TRANSCODING' },
    });

    // Queue transcoding job
    const job = await this.transcodingQueue.add(
      {
        videoId,
        inputPath: video.tempPath,
        outputDir: path.join(this.outputDir, videoId),
        videoFileName: video.fileName,
      },
      {
        jobId: videoId,
        priority: 1,
      }
    );

    this.logger.log(`Video queued for transcoding: ${videoId} (Job: ${job.id})`);
  }

  /**
   * Get video transcoding status
   */
  async getVideoStatus(videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        status: true,
        fileName: true,
        thumbnail: true,
        manifestUrl: true,
        createdAt: true,
      },
    });

    if (!video) {
      throw new Error(`Video not found: ${videoId}`);
    }

    // Get transcoding job progress if still processing
    let jobProgress = null;
    if (video.status === 'TRANSCODING') {
      const job = await this.transcodingQueue.getJob(videoId);
      if (job) {
        jobProgress = job.progress();
      }
    }

    return { ...video, jobProgress };
  }

  /**
   * Handle successful transcoding completion
   */
  async onTranscodingComplete(
    videoId: string,
    thumbnail: string,
    manifestUrl: string
  ): Promise<void> {
    await this.prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'COMPLETED',
        thumbnail,
        manifestUrl,
        completedAt: new Date(),
      },
    });

    // Clean up temporary files
    try {
      const video = await this.prisma.video.findUnique({
        where: { id: videoId },
      });
      if (video?.tempPath) {
        await fs.rm(path.dirname(video.tempPath), { recursive: true, force: true });
      }
    } catch (error) {
      this.logger.warn(`Failed to clean temp files for ${videoId}:`, error);
    }

    this.logger.log(`Video transcoding completed: ${videoId}`);
  }

  /**
   * Handle transcoding failure
   */
  async onTranscodingFailed(videoId: string, error: string): Promise<void> {
    await this.prisma.video.update({
      where: { id: videoId },
      data: { status: 'FAILED', errorMessage: error },
    });

    this.logger.error(`Video transcoding failed: ${videoId} - ${error}`);
  }

  /**
   * Get HLS stream URL for video
   */
  getHLSStreamUrl(videoId: string): string {
    return `${process.env.CDN_URL}/videos/${videoId}/playlist.m3u8`;
  }

  /**
   * Generate unique video ID
   */
  private generateVideoId(): string {
    return `vid_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Calculate video size in MB
   */
  formatFileSize(bytes: number): string {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}
