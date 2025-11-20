import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { MediaService } from './media.service';
import { Request } from 'express';

@Controller('api/media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(private mediaService: MediaService) {}

  /**
   * POST /api/media/upload/initiate
   * Initiate resumable video upload
   */
  @Post('upload/initiate')
  async initiateUpload(
    @Req() req: Request,
    @Param() body: { fileName: string; fileSize: number }
  ) {
    const userId = (req.user as any).id;

    if (!body.fileName || !body.fileSize) {
      throw new BadRequestException('fileName and fileSize are required');
    }

    if (body.fileSize > 1024 * 1024 * 500) {
      // 500MB limit
      throw new BadRequestException('File size exceeds 500MB limit');
    }

    const result = await this.mediaService.initiateVideoUpload(
      userId,
      body.fileName,
      body.fileSize
    );

    return {
      videoId: result.videoId,
      uploadUrl: `/api/media/upload/${result.videoId}`,
      maxChunkSize: 5 * 1024 * 1024, // 5MB chunks
    };
  }

  /**
   * POST /api/media/upload/complete/:videoId
   * Mark upload as complete and queue for transcoding
   */
  @Post('upload/complete/:videoId')
  async completeUpload(@Param('videoId') videoId: string) {
    try {
      await this.mediaService.completeVideoUpload(videoId);
      return {
        videoId,
        status: 'queued',
        message: 'Video queued for transcoding',
      };
    } catch (error) {
      this.logger.error(`Failed to complete upload: ${error}`);
      throw new BadRequestException('Failed to complete upload');
    }
  }

  /**
   * GET /api/media/video/:videoId/status
   * Get video transcoding status
   */
  @Get('video/:videoId/status')
  async getVideoStatus(@Param('videoId') videoId: string) {
    return this.mediaService.getVideoStatus(videoId);
  }

  /**
   * GET /api/media/video/:videoId/stream
   * Get HLS stream URL
   */
  @Get('video/:videoId/stream')
  async getStreamUrl(@Param('videoId') videoId: string) {
    const streamUrl = this.mediaService.getHLSStreamUrl(videoId);
    return { streamUrl };
  }
}
