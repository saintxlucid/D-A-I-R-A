import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';

@Module({
  controllers: [PostsController],
  controllers: [PostsController, LikesController, CommentsController],
  providers: [PostsService, LikesService, CommentsService],
})
export class PostsModule {}
