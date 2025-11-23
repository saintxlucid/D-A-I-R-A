# Backend Phase 2: Complete Implementation Guide

**Status:** ✅ Infrastructure Complete | 🚀 Ready for Implementation
**Phase Duration:** 7–10 Days
**Team Size:** 2–3 Backend Engineers

---

## Overview

Phase 2 implements production-grade API hardening across the backend. All infrastructure (DTOs, validation, rate limiting, caching, moderation) is now in place. This guide shows how to integrate these systems into existing services.

---

## 1. Database Setup (Day 1)

### Step 1: Create Prisma Migration

```bash
cd packages/backend

# Create and apply migration
npx prisma migrate dev --name add-database-indexes

# Verify indexes were created
npx prisma studio  # View schema in browser
```

### Step 2: Verify Index Creation

```sql
-- In psql or your database client
SELECT * FROM pg_indexes WHERE tablename IN ('User', 'Post', 'Follow', 'Like', 'Comment');

-- Expected output: 8+ indexes across tables
```

### Step 3: Test Query Performance

```bash
# Run performance test
npm run test:perf

# Expected results:
# - Feed retrieval: <100ms
# - Like lookup: <50ms
# - Follower count: <100ms
```

---

## 2. Install Dependencies (Day 1)

```bash
cd packages/backend

# Install all dependencies
npm install
# or
pnpm install

# Verify critical packages
npm ls @nestjs/common zod ioredis helmet
```

**Key Dependencies Added:**
- `@nestjs/common`, `@nestjs/core` - NestJS framework
- `zod` - Runtime validation
- `ioredis` - Redis client
- `helmet` - Security headers
- `passport-jwt` - JWT authentication

---

## 3. Environment Configuration (Day 1)

Create `.env` file in `packages/backend/`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/daira_dev
SHADOW_DATABASE_URL=postgresql://user:password@localhost:5432/daira_shadow

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRY=15m
REFRESH_EXPIRY=7d

# Application
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:3000
NODE_ENV=development
PORT=3000

# Email (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
```

---

## 4. Module Setup (Day 1-2)

### 4.1 Create Global Redis Module

**File:** `packages/backend/src/modules/redis.module.ts`

```typescript
import { Module } from '@nestjs/common';
import Redis from 'ioredis';

@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useValue: new Redis(process.env.REDIS_URL || 'redis://localhost:6379'),
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
```

### 4.2 Create Prisma Module

**File:** `packages/backend/src/modules/prisma.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### 4.3 Update App Module

**File:** `packages/backend/src/modules/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { RedisModule } from './redis.module';
import { PrismaModule } from './prisma.module';
import { CacheService } from '../services/cache.service';
import { ModerationService } from '../services/moderation.service';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AuthModule,
    // Add other modules here
  ],
  providers: [CacheService, ModerationService],
  exports: [CacheService, ModerationService],
})
export class AppModule {}
```

---

## 5. Validation Integration (Day 2-3)

### 5.1 Use Validation Pipe in Auth Controller

**File:** `packages/backend/src/controllers/auth.controller.ts`

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import { signupSchema, type SignupInput } from '../dtos/auth.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @UseGuards(RateLimitGuard)
  async signup(
    @Body(new ZodValidationPipe(signupSchema)) dto: SignupInput
  ) {
    return this.authService.signup(dto);
  }
}
```

### 5.2 Custom Error Messages

Create `src/filters/zod-error.filter.ts`:

```typescript
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ZodErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    if (exception.response?.errors) {
      return response.status(status).json({
        statusCode: status,
        message: 'Validation failed',
        errors: exception.response.errors,
        timestamp: new Date().toISOString(),
      });
    }

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

## 6. Rate Limiting Integration (Day 3)

### 6.1 Update Posts Controller

```typescript
import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { createPostSchema, type CreatePostInput } from '../dtos/post.dto';
import { PostsService } from '../services/posts.service';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  @UseGuards(RateLimitGuard)
  async createPost(
    @Body(new ZodValidationPipe(createPostSchema)) dto: CreatePostInput
  ) {
    return this.postsService.create(dto);
  }

  @Get('feed')
  @UseGuards(RateLimitGuard)
  async getFeed(@Query('page') page = 0) {
    return this.postsService.getFeed(page);
  }
}
```

### 6.2 Customize Rate Limits

Edit `src/guards/rate-limit.guard.ts` limits object:

```typescript
const limits: Record<string, { max: number; windowMs: number }> = {
  'POST:/api/auth/login': { max: 5, windowMs: 900 }, // 5 per 15 min
  'POST:/api/auth/signup': { max: 3, windowMs: 3600 }, // 3 per hour
  'POST:/api/posts': { max: 50, windowMs: 60 }, // 50 per minute
  'POST:/api/posts/:id/like': { max: 100, windowMs: 60 }, // 100 per minute
  default: { max: 100, windowMs: 60 },
};
```

---

## 7. Caching Integration (Day 4-5)

### 7.1 Update Posts Service

```typescript
import { Injectable } from '@nestjs/common';
import { CacheService } from './cache.service';
import { PrismaService } from './prisma.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService
  ) {}

  async getFeed(userId: string, page: number = 0) {
    // Try cache first
    const cached = await this.cache.getCachedFeed(userId, page, 20);
    if (cached) return cached;

    // Fetch from DB with optimized query
    const posts = await this.prisma.post.findMany({
      where: { /* feed filter */ },
      include: {
        author: { select: { id: true, username: true, email: true } },
        _count: { select: { likes: true, comments: true } },
      },
      take: 20,
      skip: page * 20,
      orderBy: { createdAt: 'desc' },
    });

    // Check which posts the user liked (single query)
    const userLikes = await this.prisma.like.findMany({
      where: { authorId: userId, postId: { in: posts.map(p => p.id) } },
      select: { postId: true },
    });

    const likedPostIds = new Set(userLikes.map(l => l.postId));

    const enriched = posts.map(post => ({
      ...post,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      isLiked: likedPostIds.has(post.id),
    }));

    // Cache for 1 minute
    await this.cache.cacheFeed(userId, page, 20, enriched);

    return enriched;
  }

  async createPost(userId: string, dto: CreatePostInput) {
    const post = await this.prisma.post.create({
      data: {
        content: dto.content,
        authorId: userId,
      },
      include: { author: true },
    });

    // Invalidate cache
    await this.cache.invalidateFeed(userId);
    await this.cache.invalidateTrendingPosts();

    return post;
  }
}
```

---

## 8. Moderation Integration (Day 5)

### 8.1 Add Moderation to Post Creation

```typescript
import { BadRequestException } from '@nestjs/common';
import { ModerationService } from './moderation.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private moderation: ModerationService
  ) {}

  async createPost(userId: string, dto: CreatePostInput) {
    // Check content
    const { isBlocked, reason } = await this.moderation.checkContent(
      dto.content
    );

    if (isBlocked) {
      // Log for admin review
      await this.moderation.flagContent(
        'post-pending',
        'AUTO_FLAG',
        reason,
        userId
      );

      throw new BadRequestException({
        message: 'Your post contains prohibited content',
        reason,
      });
    }

    // Create post (rest of logic)
  }
}
```

---

## 9. Testing (Day 6-7)

### 9.1 Unit Tests for Validation

**File:** `test/dtos/auth.dto.spec.ts`

```typescript
import { signupSchema, loginSchema } from '../../src/dtos/auth.dto';

describe('Auth DTOs', () => {
  it('should validate correct signup data', () => {
    const data = {
      email: 'user@example.com',
      username: 'testuser',
      password: 'SecurePass123!',
    };

    const result = signupSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject weak password', () => {
    const data = {
      email: 'user@example.com',
      username: 'testuser',
      password: 'weak',
    };

    const result = signupSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const data = {
      email: 'invalid-email',
      username: 'testuser',
      password: 'SecurePass123!',
    };

    const result = signupSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
```

### 9.2 Integration Tests for Rate Limiting

**File:** `test/guards/rate-limit.guard.spec.ts`

```typescript
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('Rate Limit Guard', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Setup app
  });

  it('should allow requests up to limit', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password' });

      expect(res.status).not.toBe(429);
    }
  });

  it('should reject requests exceeding limit', async () => {
    // Exceed limit (>5 requests within 15 min window)
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    expect(res.status).toBe(429);
    expect(res.body.message).toContain('Too many requests');
  });
});
```

---

## 10. Performance Benchmarking (Day 7-8)

### 10.1 Query Performance Test

**File:** `test/performance.spec.ts`

```typescript
describe('Performance Benchmarks', () => {
  it('should fetch feed in <100ms', async () => {
    const start = Date.now();

    const posts = await postsService.getFeed('user-123', 0);

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('should handle 100 concurrent requests', async () => {
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(
        postsService.getFeed(`user-${i}`, 0)
      );
    }

    const start = Date.now();
    await Promise.all(promises);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(5000); // 50ms per request avg
  });
});
```

### 10.2 Run Benchmarks

```bash
npm run test:perf

# Expected results:
# - Feed retrieval: <100ms ✓
# - Like lookup: <50ms ✓
# - Concurrent load: <5s for 100 requests ✓
```

---

## 11. Staging Deployment Checklist (Day 8-9)

- [ ] All database migrations applied
- [ ] Environment variables configured
- [ ] Zod validation working on all endpoints
- [ ] Rate limiting tested and tuned
- [ ] Cache invalidation working correctly
- [ ] Content moderation filtering content
- [ ] Security headers present in responses
- [ ] Error handling and logging in place
- [ ] All tests passing (>90% coverage)
- [ ] Performance benchmarks met (<100ms feed)
- [ ] Documentation updated
- [ ] Code reviewed

---

## 12. Daily Standup Template (Days 1-10)

```
Completed:
- [ ] Feature/task
- [ ] Feature/task

In Progress:
- [ ] Feature/task

Blocked:
- [ ] Issue: description

Next 24h:
- [ ] Feature/task
- [ ] Feature/task
```

---

## 13. Success Metrics

| Metric | Target | Pass Criteria |
|--------|--------|--------------|
| Feed latency (P95) | <100ms | ✓ Measured in prod |
| Rate limit accuracy | 100% | ✓ All requests logged |
| Cache hit rate | >60% | ✓ Dashboard metric |
| Moderation accuracy | >95% | ✓ Manual spot checks |
| Error rate | <0.1% | ✓ APM dashboard |
| API availability | >99.9% | ✓ Monitoring alerts |

---

## 14. Common Issues & Solutions

### Issue: "Cannot find module 'zod'"
**Solution:** Run `npm install` in backend directory

### Issue: Redis connection timeout
**Solution:** Verify `REDIS_URL` in `.env` and Redis server is running

### Issue: Rate limiting not working
**Solution:** Check that `RateLimitGuard` is applied to controller methods

### Issue: Cache not invalidating
**Solution:** Ensure `invalidateFeed()` is called after create/delete operations

---

## 15. Next Steps After Phase 2

1. **Phase 3 (Days 11-15):** Frontend UI implementation
2. **Phase 4 (Days 16-20):** DevOps & production pipeline
3. **Phase 5 (Days 21-25):** Performance optimization & scaling

---

**Questions?** Refer to `API_HARDENING.md` and `BACKEND_HARDENING_IMPLEMENTATION.md` for detailed code examples.
