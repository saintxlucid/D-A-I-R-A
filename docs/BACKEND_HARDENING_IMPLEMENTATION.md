# Backend API Hardening Implementation

This document outlines the files created for backend API hardening implementation.

## Files Created

### 1. DTOs (Data Transfer Objects) with Zod Validation
- `src/dtos/auth.dto.ts` - Authentication validation schemas
  - `signupSchema` - Register user validation
  - `loginSchema` - Login validation
  - `forgotPasswordSchema` - Password reset request
  - `resetPasswordSchema` - Password reset completion
  - `updateProfileSchema` - Profile updates

- `src/dtos/post.dto.ts` - Post and comment validation schemas
  - `createPostSchema` - Create post with content validation (≤280 chars)
  - `updatePostSchema` - Update post content
  - `createCommentSchema` - Create comment (≤500 chars)
  - `updateCommentSchema` - Update comment

### 2. Validation Pipe
- `src/pipes/zod-validation.pipe.ts` - Reusable Zod validation pipe
  - Validates request data against schemas
  - Returns structured error responses

### 3. Guards
- `src/guards/rate-limit.guard.ts` - Redis-based rate limiting
  - Auth endpoints: 10 req/15min (login), 5 req/hour (signup)
  - Post endpoints: 100 req/min
  - Like endpoints: 200 req/min
  - Comment endpoints: 50 req/min

### 4. Services
- `src/services/cache.service.ts` - Redis caching layer
  - Feed caching (1 min TTL)
  - User profile caching (5 min TTL)
  - Trending posts caching (10 min TTL)
  - Cache invalidation on updates

- `src/services/moderation.service.ts` - Content moderation
  - Keyword blocking
  - Spam detection (repeated characters, excessive URLs)
  - Capitalization detection
  - Report management framework

### 5. Database
- `prisma/schema.prisma` (updated) - Added indexes and cascade deletes
  - User table: email index
  - Post table: authorId, createdAt, updatedAt indexes
  - Follow table: followerId, followingId indexes
  - Like table: userId, postId indexes
  - Comment table: authorId, postId indexes

## Installation Instructions

### 1. Install Dependencies
```bash
cd packages/backend
npm install
# or with pnpm
pnpm install
```

### 2. Create Prisma Migration
```bash
# Navigate to backend directory
cd packages/backend

# Create migration for indexes
npx prisma migrate dev --name add-database-indexes

# Push schema to database
npx prisma db push
```

### 3. Configure Environment Variables
Create `.env` file in backend directory:
```
DATABASE_URL=postgresql://user:password@localhost:5432/daira_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=15m
REFRESH_EXPIRY=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## Usage Examples

### Using Validation Pipe in Controllers
```typescript
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { signupSchema } from '../dtos/auth.dto';

@Post('signup')
async signup(
  @Body(new ZodValidationPipe(signupSchema)) dto: SignupInput
) {
  return this.authService.signup(dto);
}
```

### Using Rate Limit Guard
```typescript
import { RateLimitGuard } from '../guards/rate-limit.guard';

@Post()
@UseGuards(RateLimitGuard)
async createPost(@Body() dto: CreatePostInput) {
  return this.postsService.create(dto);
}
```

### Using Cache Service
```typescript
async getFeed(userId: string, page: number) {
  const cached = await this.cacheService.getCachedFeed(userId, page, 20);
  if (cached) return cached;

  const feed = await this.postsService.getFeed(userId, page, 20);
  await this.cacheService.cacheFeed(userId, page, 20, feed);
  return feed;
}
```

### Using Moderation Service
```typescript
async createPost(userId: string, dto: CreatePostInput) {
  const { isBlocked, reason } = await this.moderationService.checkContent(dto.content);
  
  if (isBlocked) {
    throw new BadRequestException({ message: 'Content blocked', reason });
  }

  return this.postsService.create(userId, dto);
}
```

## Database Index Performance

The added indexes optimize these queries:
- Finding posts by author (Post.authorId)
- Sorting feed by creation date (Post.createdAt)
- Finding user's followers (Follow.followerId)
- Finding user's following list (Follow.followingId)
- Checking if user liked a post (Like.userId + postId)
- Finding comments on a post (Comment.postId)

Expected query performance:
- Feed retrieval: <100ms (with 10K posts)
- Like count: <50ms
- Follower count: <100ms
- User profile: <50ms

## Next Steps

1. **Implement controllers** - Use the validation pipes in controller methods
2. **Add service logic** - Implement business logic using these DTOs
3. **Create tests** - Add unit tests for validation and rate limiting
4. **Performance testing** - Benchmark queries with indexes
5. **Deploy to staging** - Test with realistic load

## References

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Zod Validation](https://zod.dev/)
- [Redis Caching Patterns](https://redis.io/docs/manual/patterns/)
- [NestJS Guards](https://docs.nestjs.com/guards)
