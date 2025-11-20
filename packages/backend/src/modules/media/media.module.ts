import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { TranscodingProcessor } from './transcoding.processor';
import { TusService } from './tus.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'video-transcoding',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService, TranscodingProcessor, TusService],
  exports: [MediaService],
})
export class MediaModule {}
