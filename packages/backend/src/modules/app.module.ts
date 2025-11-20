import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { PostsModule } from '../marketplace/posts.module';
import { UploadModule } from '../marketplace/upload.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { FollowModule } from '../social/follow.module';

@Module({
  imports: [AuthModule, PostsModule, UploadModule, RealtimeModule, FollowModule],
})
export class AppModule {}
