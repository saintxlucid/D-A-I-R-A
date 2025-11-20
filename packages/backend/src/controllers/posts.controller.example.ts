import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import {
  createPostSchema,
  createCommentSchema,
  type CreatePostInput,
  type CreateCommentInput,
} from '../dtos/post.dto';
import { PostsService } from '../services/posts.service';
import { ModerationService } from '../services/moderation.service';
import { CacheService } from '../services/cache.service';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private moderationService: ModerationService,
    private cacheService: CacheService
  ) {}

  @Get('feed')
  async getFeed(
    @Query('page') page: number = 0,
    @Query('pageSize') pageSize: number = 20,
    @Request() req: any
  ) {
    const userId = req.user?.id;

    // Try cache first
    const cached = await this.cacheService.getCachedFeed(userId, page, pageSize);
    if (cached) return cached;

    // Fetch from database
    const feed = await this.postsService.getFeed(userId, page, pageSize);

    // Cache for 1 minute
    await this.cacheService.cacheFeed(userId, page, pageSize, feed);

    return feed;
  }

  @Post()
  @UseGuards(RateLimitGuard)
  async createPost(
    @Body(new ZodValidationPipe(createPostSchema)) dto: CreatePostInput,
    @Request() req: any
  ) {
    const userId = req.user?.id;

    // Check content moderation
    const { isBlocked, reason } = await this.moderationService.checkContent(
      dto.content
    );

    if (isBlocked) {
      throw new BadRequestException({
        message: 'Your post contains prohibited content',
        reason,
      });
    }

    // Create post
    const post = await this.postsService.create(userId, dto);

    // Invalidate cache
    await this.cacheService.invalidateFeed(userId);
    await this.cacheService.invalidateTrendingPosts();

    return post;
  }

  @Get(':id')
  async getPost(@Param('id') postId: string) {
    return this.postsService.getById(postId);
  }

  @Delete(':id')
  async deletePost(@Param('id') postId: string, @Request() req: any) {
    const userId = req.user?.id;
    const result = await this.postsService.delete(postId, userId);

    // Invalidate related caches
    await this.cacheService.invalidateFeed(userId);
    await this.cacheService.invalidateTrendingPosts();

    return result;
  }

  @Post(':id/like')
  @UseGuards(RateLimitGuard)
  async likePost(@Param('id') postId: string, @Request() req: any) {
    const userId = req.user?.id;
    const result = await this.postsService.like(postId, userId);

    // Invalidate trending posts cache
    await this.cacheService.invalidateTrendingPosts();

    return result;
  }

  @Post(':id/unlike')
  @UseGuards(RateLimitGuard)
  async unlikePost(@Param('id') postId: string, @Request() req: any) {
    const userId = req.user?.id;
    const result = await this.postsService.unlike(postId, userId);

    // Invalidate trending posts cache
    await this.cacheService.invalidateTrendingPosts();

    return result;
  }

  @Post(':id/comments')
  @UseGuards(RateLimitGuard)
  async createComment(
    @Param('id') postId: string,
    @Body(new ZodValidationPipe(createCommentSchema)) dto: CreateCommentInput,
    @Request() req: any
  ) {
    const userId = req.user?.id;

    // Check content moderation
    const { isBlocked, reason } = await this.moderationService.checkContent(
      dto.content
    );

    if (isBlocked) {
      throw new BadRequestException({
        message: 'Your comment contains prohibited content',
        reason,
      });
    }

    return this.postsService.createComment(postId, userId, dto);
  }

  @Get(':id/comments')
  async getComments(
    @Param('id') postId: string,
    @Query('page') page: number = 0,
    @Query('pageSize') pageSize: number = 10
  ) {
    return this.postsService.getComments(postId, page, pageSize);
  }
}
