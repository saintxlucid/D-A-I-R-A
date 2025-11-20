import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

interface TranscodingJobData {
  videoId: string;
  inputPath: string;
  outputDir: string;
  videoFileName: string;
}

/**
 * Video Transcoding Worker
 * Converts input video to HLS format with multiple bitrate layers
 * Optimized for Egyptian market: 240p (3G), 480p (4G), 720p (4G+)
 */
@Processor('video-transcoding')
export class TranscodingProcessor {
  private readonly logger = new Logger(TranscodingProcessor.name);

  // Bitrate ladder for Egyptian market
  private readonly bitrateLadder = [
    { name: 'low', resolution: '240x135', bitrate: '400k', video: '400k', audio: '64k' },
    { name: 'medium', resolution: '480x270', bitrate: '800k', video: '800k', audio: '96k' },
    { name: 'high', resolution: '720x404', bitrate: '1500k', video: '1500k', audio: '128k' },
  ];

  @Process()
  async transcode(job: Job<TranscodingJobData>) {
    const { videoId, inputPath, outputDir, videoFileName } = job.data;

    try {
      this.logger.debug(`Starting transcoding for video: ${videoId}`);
      job.progress(10);

      // Create output directory
      await fs.mkdir(outputDir, { recursive: true });

      // 1. Extract thumbnail
      this.logger.debug(`Extracting thumbnail for ${videoId}`);
      await this.extractThumbnail(inputPath, outputDir, videoFileName);
      job.progress(15);

      // 2. Transcode to multiple bitrates
      this.logger.debug(`Transcoding to HLS with multiple bitrates for ${videoId}`);
      await this.transcodeToHLS(inputPath, outputDir);
      job.progress(80);

      // 3. Verify output files
      this.logger.debug(`Verifying output files for ${videoId}`);
      await this.verifyOutput(outputDir);
      job.progress(95);

      this.logger.log(`✓ Transcoding complete for video: ${videoId}`);
      job.progress(100);

      return {
        videoId,
        status: 'completed',
        outputDir,
        thumbnail: path.join(outputDir, 'thumbnail.jpg'),
        manifest: path.join(outputDir, 'playlist.m3u8'),
      };
    } catch (error) {
      this.logger.error(`Transcoding failed for ${videoId}:`, error);
      throw error;
    }
  }

  /**
   * Extract video thumbnail at 1 second
   */
  private async extractThumbnail(
    inputPath: string,
    outputDir: string,
    videoFileName: string
  ): Promise<void> {
    const thumbnailPath = path.join(outputDir, 'thumbnail.jpg');
    const command = `ffmpeg -i "${inputPath}" -ss 1 -vf "scale=320:180" -q:v 5 "${thumbnailPath}"`;

    try {
      await execAsync(command);
      this.logger.debug(`Thumbnail extracted to ${thumbnailPath}`);
    } catch (error) {
      this.logger.error(`Failed to extract thumbnail: ${error}`);
      throw error;
    }
  }

  /**
   * Transcode video to HLS with multiple bitrate streams
   * Uses FFmpeg with libx264 codec
   */
  private async transcodeToHLS(inputPath: string, outputDir: string): Promise<void> {
    // Generate individual stream files
    const streamCommands = this.bitrateLadder.map((bitrate) => {
      const streamDir = path.join(outputDir, bitrate.name);
      return this.generateStreamCommand(inputPath, streamDir, bitrate);
    });

    // Execute all transcoding commands in sequence
    for (const command of streamCommands) {
      try {
        this.logger.debug(`Executing FFmpeg command: ${command.substring(0, 50)}...`);
        await execAsync(command, { maxBuffer: 50 * 1024 * 1024 }); // 50MB buffer
      } catch (error) {
        this.logger.error(`FFmpeg error: ${error}`);
        throw error;
      }
    }

    // Generate master playlist
    await this.generateMasterPlaylist(outputDir);
  }

  /**
   * Generate FFmpeg command for individual bitrate stream
   */
  private generateStreamCommand(
    inputPath: string,
    outputDir: string,
    bitrate: any
  ): string {
    return `
      ffmpeg -i "${inputPath}" \
        -c:v libx264 \
        -preset medium \
        -crf 23 \
        -s ${bitrate.resolution} \
        -b:v ${bitrate.video} \
        -c:a aac \
        -b:a ${bitrate.audio} \
        -f hls \
        -hls_time 10 \
        -hls_list_size 0 \
        -hls_segment_filename "${outputDir}/${bitrate.name}-%d.ts" \
        "${outputDir}/${bitrate.name}.m3u8"
    `.trim();
  }

  /**
   * Generate HLS master playlist
   * Allows adaptive bitrate switching
   */
  private async generateMasterPlaylist(outputDir: string): Promise<void> {
    const playlistContent = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD

${this.bitrateLadder
  .map(
    (bitrate) => `#EXT-X-STREAM-INF:BANDWIDTH=${this.parseBitrate(bitrate.bitrate)},RESOLUTION=${bitrate.resolution}
${bitrate.name}/${bitrate.name}.m3u8`
  )
  .join('\n')}

#EXT-X-ENDLIST`;

    await fs.writeFile(path.join(outputDir, 'playlist.m3u8'), playlistContent);
    this.logger.debug(`Master playlist generated at ${outputDir}/playlist.m3u8`);
  }

  /**
   * Parse bitrate string (e.g., "400k" -> 400000)
   */
  private parseBitrate(bitrateStr: string): number {
    const multiplier = bitrateStr.endsWith('k') ? 1000 : 1;
    return parseInt(bitrateStr) * multiplier;
  }

  /**
   * Verify all output files were created
   */
  private async verifyOutput(outputDir: string): Promise<void> {
    const requiredFiles = [
      'playlist.m3u8',
      'thumbnail.jpg',
      ...this.bitrateLadder.flatMap((b) => [`${b.name}/${b.name}.m3u8`]),
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(outputDir, file);
      try {
        await fs.access(filePath);
      } catch (error) {
        throw new Error(`Output file missing: ${filePath}`);
      }
    }

    this.logger.debug(`All output files verified in ${outputDir}`);
  }
}
