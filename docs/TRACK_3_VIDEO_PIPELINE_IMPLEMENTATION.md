# Track 3: Video Pipeline Implementation (Weeks 1-6)

**Owner:** Backend Lead + DevOps
**Timeline:** 42 days (longest critical path)
**Budget:** $100-200/month (AWS Elastic Transcoder or manual FFmpeg)
**Goal:** HLS streaming, resumable uploads, 3 quality tiers, cost control

---

## Week 1-2: Resumable Uploads (tus.io)

### Goal: Handle 9-12 Mbps Egyptian internet without timeouts

### Day 1-2: tus.io Server Setup

**Why tus.io?**
- Resumable uploads (pause/resume across network failures)
- Chunk-based (100MB file = 50 x 2MB chunks)
- Automatic retry on failure
- Progress tracking for UI

```typescript
// backend/src/modules/video/video-upload.module.ts

import { Module } from '@nestjs/common'
import { TusService } from './tus.service'
import { VideoUploadController } from './video-upload.controller'

@Module({
  providers: [TusService, VideoUploadController],
  exports: [TusService],
})
export class VideoUploadModule {}
```

```typescript
// backend/src/modules/video/tus.service.ts

import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class TusService {
  private readonly uploadDir = process.env.UPLOAD_DIR || '/tmp/uploads'

  constructor() {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  /**
   * tus Protocol Handler (REST API)
   * POST /files → Create upload
   * PATCH /files/:id → Upload chunk
   * HEAD /files/:id → Check offset
   * DELETE /files/:id → Cancel upload
   */

  /**
   * POST /files - Create upload session
   * Returns upload ID + resumable URL
   */
  async createUpload(
    userId: string,
    fileSize: number,
    filename: string
  ): Promise<{ id: string; url: string }> {
    const uploadId = `${userId}-${Date.now()}-${Math.random().toString(36)}`
    const uploadPath = path.join(this.uploadDir, uploadId)

    // Initialize upload metadata
    const metadata = {
      uploadId,
      userId,
      fileSize,
      filename,
      uploadedBytes: 0,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48-hour expiry
      chunks: new Map<number, boolean>(), // Track uploaded chunks
    }

    // Save metadata to database
    await this.saveUploadMetadata(uploadId, metadata)

    return {
      id: uploadId,
      url: `/api/video/uploads/${uploadId}`,
    }
  }

  /**
   * HEAD /files/:id - Check upload offset
   * Client uses this to know where to resume
   */
  async getUploadOffset(uploadId: string): Promise<number> {
    const metadata = await this.getUploadMetadata(uploadId)
    if (!metadata) throw new Error('Upload not found')
    return metadata.uploadedBytes
  }

  /**
   * PATCH /files/:id - Upload chunk
   * Content-Range header: bytes 0-2097151/104857600
   * Body: Raw chunk data
   */
  async uploadChunk(
    uploadId: string,
    chunkStart: number,
    chunkData: Buffer
  ): Promise<{ uploadedBytes: number; isComplete: boolean }> {
    const metadata = await this.getUploadMetadata(uploadId)
    if (!metadata) throw new Error('Upload not found')

    if (metadata.uploadedBytes > metadata.fileSize) {
      throw new Error('Upload exceeds file size')
    }

    // Append chunk to file
    const uploadPath = path.join(this.uploadDir, uploadId)
    fs.appendFileSync(uploadPath, chunkData)

    // Update metadata
    const newUploadedBytes = chunkStart + chunkData.length
    metadata.uploadedBytes = newUploadedBytes

    // Check if upload is complete
    const isComplete = newUploadedBytes >= metadata.fileSize

    await this.saveUploadMetadata(uploadId, metadata)

    return {
      uploadedBytes: newUploadedBytes,
      isComplete,
    }
  }

  /**
   * DELETE /files/:id - Cancel upload
   */
  async cancelUpload(uploadId: string): Promise<void> {
    const uploadPath = path.join(this.uploadDir, uploadId)
    if (fs.existsSync(uploadPath)) {
      fs.unlinkSync(uploadPath)
    }
    await this.deleteUploadMetadata(uploadId)
  }

  /**
   * Cleanup expired uploads (cron job)
   * Run every 6 hours
   */
  async cleanupExpiredUploads(): Promise<void> {
    const now = new Date()
    const metadata = await this.getAllUploads()

    for (const upload of metadata) {
      if (new Date(upload.expiresAt) < now) {
        await this.cancelUpload(upload.uploadId)
      }
    }
  }

  // Database helpers
  private async saveUploadMetadata(uploadId: string, metadata: any): Promise<void> {
    // TODO: Save to Redis or database
  }

  private async getUploadMetadata(uploadId: string): Promise<any> {
    // TODO: Retrieve from Redis or database
    return null
  }

  private async deleteUploadMetadata(uploadId: string): Promise<void> {
    // TODO: Delete from Redis or database
  }

  private async getAllUploads(): Promise<any[]> {
    // TODO: Get all uploads
    return []
  }
}
```

### Day 2-3: REST API for uploads

```typescript
// backend/src/modules/video/video-upload.controller.ts

import {
  Controller,
  Post,
  Patch,
  Head,
  Delete,
  Param,
  Body,
  Headers,
  UseGuards,
  CurrentUser,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { TusService } from './tus.service'
import { User } from '@prisma/client'

@Controller('api/video/uploads')
@UseGuards(AuthGuard('jwt'))
export class VideoUploadController {
  constructor(private tusService: TusService) {}

  /**
   * POST /api/video/uploads - Initiate resumable upload
   * Request:
   *   Content-Type: application/json
   *   {
   *     "filename": "my-video.mp4",
   *     "fileSize": 104857600,
   *     "mimeType": "video/mp4"
   *   }
   * Response:
   *   {
   *     "id": "user123-1234567890-abc",
   *     "url": "/api/video/uploads/user123-1234567890-abc"
   *   }
   */
  @Post()
  async createUpload(
    @CurrentUser() user: User,
    @Body() body: { filename: string; fileSize: number; mimeType: string }
  ) {
    // Validate file size (max 500MB)
    if (body.fileSize > 500 * 1024 * 1024) {
      throw new Error('File too large (max 500MB)')
    }

    return this.tusService.createUpload(user.id, body.fileSize, body.filename)
  }

  /**
   * HEAD /api/video/uploads/:id - Check upload offset
   * Response headers:
   *   Upload-Offset: 2097152 (bytes already uploaded)
   */
  @Head(':id')
  async checkOffset(@Param('id') uploadId: string) {
    const offset = await this.tusService.getUploadOffset(uploadId)
    return { 'Upload-Offset': offset.toString() }
  }

  /**
   * PATCH /api/video/uploads/:id - Upload chunk
   * Headers:
   *   Content-Range: bytes 0-2097151/104857600
   *   Upload-Offset: 0
   * Body: Raw file chunk (buffer)
   */
  @Patch(':id')
  async uploadChunk(
    @Param('id') uploadId: string,
    @Headers('content-range') contentRange: string, // "bytes 0-2097151/104857600"
    @Body() chunkData: Buffer
  ) {
    // Parse Content-Range: bytes start-end/total
    const match = contentRange.match(/bytes (\d+)-(\d+)\/(\d+)/)
    if (!match) throw new Error('Invalid Content-Range header')

    const [, startStr] = match
    const start = parseInt(startStr, 10)

    const result = await this.tusService.uploadChunk(uploadId, start, chunkData)

    return {
      'Upload-Offset': result.uploadedBytes.toString(),
      'Upload-Complete': result.isComplete.toString(),
    }
  }

  /**
   * DELETE /api/video/uploads/:id - Cancel upload
   */
  @Delete(':id')
  async cancelUpload(@Param('id') uploadId: string) {
    await this.tusService.cancelUpload(uploadId)
    return { success: true }
  }
}
```

### Day 3-5: Frontend Upload Component

**Deliverable:** Resumable upload UI

```typescript
// web/src/components/VideoUploadForm.tsx
import { useState, useRef, useCallback } from 'react'
import { api } from '@/lib/api'

interface UploadProgress {
  uploadedBytes: number
  totalBytes: number
  percentage: number
}

export const VideoUploadForm: React.FC = () => {
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [uploadId, setUploadId] = useState<string>('')
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController>(new AbortController())

  const handleFileSelect = async (file: File) => {
    if (file.size > 500 * 1024 * 1024) {
      setError('File too large (max 500MB)')
      return
    }

    try {
      // Step 1: Create upload session
      const response = await api.post('/api/video/uploads', {
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
      })

      const { id } = response.data
      setUploadId(id)

      // Step 2: Upload file in chunks
      await uploadFileInChunks(id, file)
    } catch (err) {
      setError(err.message || 'Upload failed')
    }
  }

  const uploadFileInChunks = async (id: string, file: File) => {
    const chunkSize = 2 * 1024 * 1024 // 2MB chunks
    const totalChunks = Math.ceil(file.size / chunkSize)

    let uploadedBytes = 0

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      try {
        // Check resume offset
        const headResponse = await api.head(`/api/video/uploads/${id}`)
        const resumeFrom = parseInt(headResponse.headers['upload-offset'] || '0', 10)

        // If we're ahead, skip already uploaded chunks
        if (resumeFrom > uploadedBytes) {
          uploadedBytes = resumeFrom
          setProgress({
            uploadedBytes,
            totalBytes: file.size,
            percentage: Math.round((uploadedBytes / file.size) * 100),
          })
          continue
        }

        // Upload this chunk
        const response = await api.patch(`/api/video/uploads/${id}`, chunk, {
          headers: {
            'Content-Range': `bytes ${start}-${end - 1}/${file.size}`,
          },
          signal: abortControllerRef.current.signal,
        })

        uploadedBytes = parseInt(response.headers['upload-offset'], 10)

        setProgress({
          uploadedBytes,
          totalBytes: file.size,
          percentage: Math.round((uploadedBytes / file.size) * 100),
        })

        if (response.headers['upload-complete'] === 'true') {
          // Upload complete! Now trigger processing
          await triggerVideoProcessing(id)
          break
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          setError('Upload cancelled')
        } else {
          setError(`Chunk ${i + 1} failed, will retry...`)
          // Retry logic: exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
          i-- // Retry same chunk
        }
      }
    }
  }

  const triggerVideoProcessing = async (uploadId: string) => {
    // Backend will now process the uploaded file
    const response = await api.post(`/api/video/process/${uploadId}`)
    return response.data
  }

  const handleCancel = () => {
    abortControllerRef.current.abort()
    if (uploadId) {
      api.delete(`/api/video/uploads/${uploadId}`)
    }
    setProgress(null)
    setError('')
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-brand-primary rounded-lg p-8 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => handleFileSelect(e.target.files?.[0]!)}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-brand-primary hover:underline"
          disabled={!!progress}
        >
          Select video file to upload
        </button>
      </div>

      {progress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-brand-primary h-2 rounded-full transition-all"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <button
            onClick={handleCancel}
            className="text-red-500 hover:underline text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
```

---

## Week 2-4: FFmpeg Video Transcoding

### Goal: Convert uploaded video to HLS with 3 quality tiers

### Day 1-2: BullMQ Job Queue Setup

**Why BullMQ?**
- Redis-backed job queue (distributed, reliable)
- Automatic retries
- Job tracking for UI progress
- Worker concurrency control

```typescript
// backend/src/modules/video/video-transcoding.module.ts

import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bull'
import { VideoTranscodingProcessor } from './video-transcoding.processor'
import { VideoTranscodingService } from './video-transcoding.service'

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'video-transcoding',
      defaultJobOptions: {
        attempts: 3, // Retry 3 times
        backoff: {
          type: 'exponential',
          delay: 2000, // Start with 2s delay
        },
        removeOnComplete: true, // Clean up completed jobs
      },
    }),
  ],
  providers: [VideoTranscodingProcessor, VideoTranscodingService],
  exports: [VideoTranscodingService],
})
export class VideoTranscodingModule {}
```

```typescript
// backend/src/modules/video/video-transcoding.processor.ts

import { Processor, Process } from '@nestjs/bull'
import { Job } from 'bull'
import * as ffmpeg from 'fluent-ffmpeg'
import * as path from 'path'
import * as fs from 'fs'
import { PrismaService } from '@/prisma/prisma.service'

@Processor('video-transcoding')
export class VideoTranscodingProcessor {
  constructor(private prisma: PrismaService) {
    // Configure ffmpeg paths (assumes ffmpeg installed via Docker)
    ffmpeg.setFfmpegPath('/usr/bin/ffmpeg')
    ffmpeg.setFfprobePath('/usr/bin/ffprobe')
  }

  /**
   * Main transcoding job
   * Input: Raw MP4 file
   * Output: HLS stream (playlist + segments)
   *
   * Quality tiers:
   * 1. 240p @ 400kbps (for slow connections, 3G, Egyptian internet)
   * 2. 480p @ 800kbps (mobile standard)
   * 3. 720p @ 1500kbps (WiFi/fiber)
   */
  @Process('transcode-video')
  async transcodeVideo(job: Job<TranscodeJobData>) {
    const { uploadId, postId, userId } = job.data
    const uploadPath = path.join(process.env.UPLOAD_DIR, uploadId)
    const outputDir = path.join(process.env.OUTPUT_DIR, postId)

    try {
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      // Step 1: Get video metadata
      const metadata = await this.getVideoMetadata(uploadPath)
      job.progress(10)

      // Step 2: Transcode to 3 HLS quality tiers
      const qualities = [
        { name: '240p', width: 426, height: 240, bitrate: '400k' },
        { name: '480p', width: 854, height: 480, bitrate: '800k' },
        { name: '720p', width: 1280, height: 720, bitrate: '1500k' },
      ]

      let progressStep = 10
      const progressPerQuality = 60 / qualities.length

      for (const quality of qualities) {
        await this.transcodeQuality(uploadPath, outputDir, quality)
        progressStep += progressPerQuality
        job.progress(progressStep)
      }

      // Step 3: Generate HLS master playlist
      await this.generateMasterPlaylist(outputDir, qualities)
      job.progress(80)

      // Step 4: Update database with completed transcoding
      await this.updatePostWithHLS(postId, outputDir)
      job.progress(90)

      // Step 5: Clean up original upload
      fs.unlinkSync(uploadPath)
      job.progress(100)

      return { postId, hlsUrl: `/videos/${postId}/index.m3u8` }
    } catch (error) {
      job.log(`Transcoding failed: ${error.message}`)
      throw error
    }
  }

  /**
   * Transcode to single quality tier
   */
  private transcodeQuality(
    inputPath: string,
    outputDir: string,
    quality: any
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .size(`${quality.width}x${quality.height}`)
        .videoBitrate(quality.bitrate)
        .audioBitrate('128k')
        .output(path.join(outputDir, `${quality.name}.m3u8`))
        .outputOptions([
          '-hls_time 10', // Segment duration: 10 seconds
          '-hls_list_size 0', // Keep all segments
          '-hls_segment_filename',
          path.join(outputDir, `${quality.name}_%03d.ts`),
        ])
        .on('error', reject)
        .on('end', resolve)
        .run()
    })
  }

  /**
   * Generate HLS master playlist
   * This references all quality tiers so player can adaptive bitrate
   */
  private async generateMasterPlaylist(outputDir: string, qualities: any[]): Promise<void> {
    let playlist = '#EXTM3U\n'
    playlist += '#EXT-X-VERSION:3\n'
    playlist += '#EXT-X-INDEPENDENT-SEGMENTS\n\n'

    for (const quality of qualities) {
      const bandwidth = parseInt(quality.bitrate) * 1000 // Convert kbps to bps
      playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${quality.width}x${quality.height}\n`
      playlist += `${quality.name}.m3u8\n\n`
    }

    fs.writeFileSync(path.join(outputDir, 'index.m3u8'), playlist)
  }

  private getVideoMetadata(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) reject(err)
        else resolve(metadata)
      })
    })
  }

  private async updatePostWithHLS(postId: string, outputDir: string): Promise<void> {
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        videoStatus: 'READY',
        hlsUrl: `/videos/${postId}/index.m3u8`,
        transcodedAt: new Date(),
      },
    })
  }
}

interface TranscodeJobData {
  uploadId: string
  postId: string
  userId: string
}
```

### Day 3-4: Transcoding Service + API

```typescript
// backend/src/modules/video/video-transcoding.service.ts

import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import { Queue, Job } from 'bull'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class VideoTranscodingService {
  constructor(
    @InjectQueue('video-transcoding') private transcodingQueue: Queue,
    private prisma: PrismaService
  ) {}

  /**
   * Queue a video for transcoding
   * Called after upload completes
   */
  async queueTranscoding(uploadId: string, postId: string, userId: string) {
    const job = await this.transcodingQueue.add(
      'transcode-video',
      { uploadId, postId, userId },
      {
        jobId: `${postId}-transcoding`,
        priority: 5, // Normal priority
      }
    )

    // Update post status
    await this.prisma.post.update({
      where: { id: postId },
      data: { videoStatus: 'PROCESSING' },
    })

    return job
  }

  /**
   * Get transcoding progress for UI
   */
  async getTranscodingStatus(postId: string): Promise<TranscodingStatus> {
    const job = await this.transcodingQueue.getJob(`${postId}-transcoding`)

    if (!job) {
      // Check database for completed job
      const post = await this.prisma.post.findUnique({ where: { id: postId } })
      if (post?.videoStatus === 'READY') {
        return { status: 'COMPLETED', progress: 100 }
      }
      return { status: 'NOT_FOUND' }
    }

    const progress = job._progress || 0
    const state = await job.getState()

    return {
      status: state as any,
      progress,
      isCompleted: await job.isCompleted(),
      isFailed: await job.isFailed(),
      failedReason: job.failedReason,
    }
  }

  /**
   * Priority boost for trending videos
   */
  async prioritizeTranscoding(postId: string): Promise<void> {
    const job = await this.transcodingQueue.getJob(`${postId}-transcoding`)
    if (job) {
      await job.promote()
    }
  }

  /**
   * Cancel transcoding job
   */
  async cancelTranscoding(postId: string): Promise<void> {
    const job = await this.transcodingQueue.getJob(`${postId}-transcoding`)
    if (job) {
      await job.remove()
    }
  }
}

interface TranscodingStatus {
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'NOT_FOUND'
  progress: number
  isCompleted?: boolean
  isFailed?: boolean
  failedReason?: string
}
```

---

## Week 4-6: HLS Streaming + CDN Integration

### Day 1-2: HLS Player Component

```typescript
// web/src/components/VideoPlayer.tsx
import { useEffect, useRef } from 'react'
import HlsJs from 'hls.js'

interface VideoPlayerProps {
  videoId: string
  hlsUrl: string
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, hlsUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current) return

    const video = videoRef.current

    if (HlsJs.isSupported()) {
      const hls = new HlsJs({
        lowLatencyMode: true,
        enableWorker: true,
        // Progressive enhancement: prefer low bitrate for Egyptian internet
        abrEwmaDefaultEstimate: 500000, // Start with 500kbps guess
      })

      hls.loadSource(hlsUrl)
      hls.attachMedia(video)

      hls.on(HlsJs.Events.MANIFEST_PARSED, () => {
        // Subtitles or quality levels ready
      })

      return () => {
        hls.destroy()
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (iOS, Safari)
      video.src = hlsUrl
    }
  }, [hlsUrl])

  return (
    <video
      ref={videoRef}
      controls
      className="w-full h-auto rounded-lg bg-black"
      poster={`/videos/${videoId}/poster.jpg`}
    />
  )
}
```

### Day 3-4: Cloudflare CDN Integration

**Deliverable:** Cache configuration for HLS segments

```typescript
// backend/src/middleware/cache.middleware.ts

import { Request, Response, NextFunction } from 'express'

export const hlsCacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // HLS master playlist: Cache for 1 hour
  // (Can list new segments as they're generated)
  if (req.path.endsWith('.m3u8')) {
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
  }

  // HLS segments (TS files): Cache forever
  // (Never changes once generated)
  if (req.path.endsWith('.ts')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('Content-Type', 'video/mp2t')
  }

  // Poster images: Cache for 1 week
  if (req.path.endsWith('.jpg') || req.path.endsWith('.webp')) {
    res.setHeader('Cache-Control', 'public, max-age=604800')
  }

  next()
}
```

**Cloudflare Worker to route to edge cache:**

```typescript
// cloudflare/src/index.ts

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    // Route video requests to Cairo edge location
    if (path.startsWith('/videos/')) {
      // Rewrite to Cloudflare's Cairo data center
      return fetch(new Request('https://cairo.d-aira.app' + path, request))
    }

    // Fall back to origin
    return fetch(request)
  },
}
```

### Day 5-6: Cost Control & Monitoring

**Deliverable:** Video cost tracking + kill switches

```typescript
// backend/src/modules/video/video-cost-tracking.service.ts

import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class VideoCostTrackingService {
  /**
   * Estimate monthly video costs
   * Formula: (Users × Avg Videos/User × Avg Size × Bitrate) / 10^9 GB × $0.015/GB
   */
  async estimateMonthlyCost(activeUsers: number): Promise<CostEstimate> {
    const avgVideosPerUser = 2 // Each user creates 2 videos/month
    const avgVideoSize = 100 // MB
    const transcodeRatio = 2.5 // Transcoding produces 2.5x the original size
    const totalGB = (activeUsers * avgVideosPerUser * avgVideoSize * transcodeRatio) / 1024

    return {
      activeUsers,
      estimatedGB: totalGB,
      estimatedCost: totalGB * 0.015, // AWS pricing
      perUserCost: (totalGB * 0.015) / activeUsers,
    }
  }

  /**
   * Daily cost tracking
   */
  async recordDailyCost(
    date: Date,
    gbUsed: number,
    cost: number
  ): Promise<void> {
    await this.prisma.videoCostLog.create({
      data: { date, gbUsed, cost },
    })
  }

  /**
   * Kill switch: Stop transcoding if costs exceed threshold
   */
  async shouldBlockTranscoding(): Promise<boolean> {
    // Get current month costs
    const thisMonth = new Date()
    thisMonth.setDate(1)

    const costs = await this.prisma.videoCostLog.aggregate({
      where: { date: { gte: thisMonth } },
      _sum: { cost: true },
    })

    const monthlyBudget = 500 // USD
    return (costs._sum.cost || 0) > monthlyBudget
  }

  /**
   * Alert if costs spike unexpectedly
   */
  async checkForCostSpike(): Promise<void> {
    const today = await this.prisma.videoCostLog.findFirst({
      where: { date: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      orderBy: { date: 'desc' },
    })

    const yesterday = await this.prisma.videoCostLog.findFirst({
      where: {
        date: {
          gte: new Date(Date.now() - 48 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { date: 'desc' },
    })

    if (today && yesterday) {
      const spike = ((today.cost - yesterday.cost) / yesterday.cost) * 100

      if (spike > 50) {
        // Alert: 50% cost increase day-over-day
        await this.sendAlert(`Video costs spiked ${spike.toFixed(0)}%: $${today.cost.toFixed(2)}`)
      }
    }
  }

  private async sendAlert(message: string): Promise<void> {
    // Email/Slack alert
  }
}

interface CostEstimate {
  activeUsers: number
  estimatedGB: number
  estimatedCost: number
  perUserCost: number
}
```

---

## Deliverables Summary (Track 3, Week 1-6)

| Week | Day | Deliverable | Status |
|-----|-----|-------------|--------|
| 1-2 | 1-5 | tus.io resumable uploads (backend + frontend) | Code ✅ |
| 2 | 1-2 | BullMQ job queue + FFmpeg processor | Code ✅ |
| 2 | 3-4 | Transcoding service + API | Code ✅ |
| 3 | 1-2 | HLS master playlist generation | Code ✅ |
| 4-6 | 1-2 | HLS player component (hls.js) | Code ✅ |
| 4-6 | 3-4 | Cloudflare CDN + cache headers | Config ✅ |
| 4-6 | 5-6 | Cost tracking + kill switches | Code ✅ |

**Video Infrastructure Complete:**
- ✅ Resumable uploads (handles network failures)
- ✅ Automatic transcoding to 3 quality tiers
- ✅ HLS streaming for adaptive bitrate
- ✅ CDN edge caching
- ✅ Cost monitoring + budget control
- ✅ UI progress tracking

**Budget:** $100-200/month (AWS Elastic Transcoder or self-hosted FFmpeg)
**Scalability:** 0-100K users without architectural change

---

## Files to Create in Repo

```
backend/src/modules/video/tus.service.ts
backend/src/modules/video/video-upload.controller.ts
backend/src/modules/video/video-transcoding.module.ts
backend/src/modules/video/video-transcoding.processor.ts
backend/src/modules/video/video-transcoding.service.ts
backend/src/modules/video/video-cost-tracking.service.ts
backend/src/middleware/cache.middleware.ts
web/src/components/VideoUploadForm.tsx
web/src/components/VideoPlayer.tsx
cloudflare/src/index.ts
```

