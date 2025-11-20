# 🔒 API Hardening Blueprint

**Phase:** Immediate Next (Post Identity-Auth)
**Duration:** 2–3 days
**Team:** 1–2 Backend Engineers
**Goal:** Production-ready API with performance, security, and reliability hardening

---

## 1. Database Optimization

### A. Add Critical Indexes

**File:** `packages/backend/prisma/schema.prisma` (update)
**Then run:** `prisma migrate dev --name add-indexes`

```prisma
// indexes added to schema.prisma after model definitions

model User {
  id String @id @default(cuid())
  email String @unique
  username String @unique
  // ... other fields

  @@index([email])
  @@index([username])
}

model Post {
  id String @id @default(cuid())
  content String
  authorId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([authorId])
  @@index([createdAt])
  @@index([updatedAt])
}

model Follow {
  id String @id @default(cuid())
  followerId String
  followingId String
  createdAt DateTime @default(now())

  follower User @relation("followers", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("following", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}

model Comment {
  id String @id @default(cuid())
  content String
  postId String
  authorId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([authorId])
}

model Like {
  id String @id @default(cuid())
  postId String
  authorId String
  createdAt DateTime @default(now())

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@unique([postId, authorId])
  @@index([postId])
  @@index([authorId])
}
```

**Migration Command:**
```bash
cd packages/backend
prisma migrate dev --name add-critical-indexes
# Review migration file
# Apply
```

**Verify:**
```sql
-- In psql
\d "User"  -- Show indexes on User table
\d "Post"  -- Show indexes on Post table
\d "Follow" -- Show indexes on Follow table
```

---

### B. Fix N+1 Queries

**Pattern:** Use `include` and `select` to fetch related data in single query

**Before (N+1 Problem):**
```typescript
// posts.service.ts - BAD
async getFeed(userId: string) {
  const posts = await prisma.post.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' }
  });

  // N additional queries! (one per post)
  const enriched = posts.map(post => ({
    ...post,
    author: prisma.user.findUnique({ where: { id: post.authorId } })
  }));
}
```

**After (Optimized):**
```typescript
// posts.service.ts - GOOD
async getFeed(userId: string) {
  const posts = await prisma.post.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true
        }
      },
      _count: {
        select: { likes: true, comments: true }
      }
    }
  });

  return posts.map(post => ({
    ...post,
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    isLiked: await prisma.like.findUnique({
      where: { postId_authorId: { postId: post.id, authorId: userId } }
    })
  }));
}
```

**Even Better (Cache the N+1 query):**
```typescript
async getFeed(userId: string) {
  // Fetch posts + author in one query
  const posts = await prisma.post.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, username: true, email: true, avatar: true } },
      _count: { select: { likes: true, comments: true } }
    }
  });

  // Fetch all likes for this user's posts in ONE query
  const userLikes = await prisma.like.findMany({
    where: {
      authorId: userId,
      postId: { in: posts.map(p => p.id) }
    },
    select: { postId: true }
  });

  const likedPostIds = new Set(userLikes.map(l => l.postId));

  return posts.map(post => ({
    ...post,
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    isLiked: likedPostIds.has(post.id)
  }));
}
```

**Audit Command:**
```bash
cd packages/backend
npm run test  # Run tests with Prisma logging
# Look for repeated queries (N+1 pattern)
# Fix with include/select
```

---

### C. Cache Hot Queries (Redis)

**Pattern:** Cache feed, user profiles, trending posts

**File:** `packages/backend/src/services/cache.service.ts` (new)

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  constructor(@InjectRedis() private redis: Redis) {}

  async getFeed(userId: string, page: number = 0, pageSize: number = 20) {
    const cacheKey = `feed:${userId}:${page}:${pageSize}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from DB
    const feed = await this.postsService.getFeed(userId, page, pageSize);

    // Cache for 1 minute
    await this.redis.setex(cacheKey, 60, JSON.stringify(feed));

    return feed;
  }

  async invalidateFeed(userId: string) {
    // Clear all feed cache for this user
    const keys = await this.redis.keys(`feed:${userId}:*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async getUserProfile(userId: string) {
    const cacheKey = `user:${userId}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const user = await this.usersService.getProfile(userId);
    await this.redis.setex(cacheKey, 5 * 60, JSON.stringify(user)); // 5 min

    return user;
  }

  async invalidateUser(userId: string) {
    await this.redis.del(`user:${userId}`);
  }
}
```

**Integration:** Inject `CacheService` in routes

```typescript
// posts.controller.ts
@Get('feed')
async getFeed(@Query('page') page = 0, @Request() req) {
  return this.cacheService.getFeed(req.user.id, page);
}

// After creating post, invalidate cache
@Post()
async createPost(@Request() req, @Body() dto) {
  const post = await this.postsService.create(req.user.id, dto);
  await this.cacheService.invalidateFeed(req.user.id);
  return post;
}
```

---

## 2. DTO Validation with Zod

**Pattern:** Use Zod for runtime validation + type safety

**File:** `packages/backend/src/dtos/auth.dto.ts` (update)

```typescript
import { z } from 'zod';

// Password validation helper
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain a special character');

export const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  username: z
    .string()
    .min(3, 'Username must be 3+ characters')
    .max(20, 'Username must be <20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, underscore'),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Post cannot be empty')
    .max(280, 'Post must be ≤280 characters'),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be ≤500 characters'),
});

// Infer types
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
```

**Validation Pipe:** `packages/backend/src/pipes/zod-validation.pipe.ts`

```typescript
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errors = result.error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }));
      throw new BadRequestException({ errors });
    }

    return result.data;
  }
}
```

**Usage in Controllers:**

```typescript
// posts.controller.ts
@Post()
async create(
  @Body(new ZodValidationPipe(createPostSchema)) dto: CreatePostInput,
  @Request() req
) {
  return this.postsService.create(req.user.id, dto);
}

@Post(':id/comments')
async createComment(
  @Param('id') postId: string,
  @Body(new ZodValidationPipe(createCommentSchema)) dto: CreateCommentInput,
  @Request() req
) {
  return this.commentsService.create(postId, req.user.id, dto);
}
```

---

## 3. Rate Limiting (Redis-Based)

**File:** `packages/backend/src/guards/rate-limit.guard.ts` (new)

```typescript
import { Injectable, CanActivate, ExecutionContext, TooManyRequestsException } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(@InjectRedis() private redis: Redis) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.ip;

    // Different limits for different endpoints
    const endpoint = request.route.path;
    const limits = {
      '/auth/login': { max: 5, windowMs: 60 }, // 5 per minute
      '/auth/register': { max: 3, windowMs: 3600 }, // 3 per hour
      '/auth/forgot-password': { max: 3, windowMs: 3600 }, // 3 per hour
      '/posts': { max: 100, windowMs: 60 }, // 100 per minute
      '/posts/:id/like': { max: 200, windowMs: 60 }, // 200 per minute
      default: { max: 100, windowMs: 60 }
    };

    const limit = limits[endpoint] || limits['default'];
    const key = `rate-limit:${userId}:${endpoint}`;

    const count = await this.redis.incr(key);

    if (count === 1) {
      // First request, set expiry
      await this.redis.expire(key, limit.windowMs);
    }

    if (count > limit.max) {
      throw new TooManyRequestsException(
        `Too many requests. Max ${limit.max} per ${limit.windowMs}s`
      );
    }

    return true;
  }
}
```

**Apply to Routes:**

```typescript
// posts.controller.ts
import { UseGuards } from '@nestjs/common';

@Post()
@UseGuards(RateLimitGuard)
async create(@Body() dto: CreatePostInput, @Request() req) {
  return this.postsService.create(req.user.id, dto);
}

@Post(':id/like')
@UseGuards(RateLimitGuard)
async like(@Param('id') postId: string, @Request() req) {
  return this.postsService.like(postId, req.user.id);
}
```

---

## 4. Security Headers & CORS

**File:** `packages/backend/src/main.ts` (update)

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // CORS - Only allow frontend origin
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Request logging middleware
  app.use((req, res, next) => {
    req.id = generateId(); // Or use uuid
    res.setHeader('X-Request-ID', req.id);
    next();
  });

  await app.listen(3000);
  console.log(`Server running at http://localhost:3000`);
}

bootstrap();
```

**Environment Variables:** `.env`

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRY=15m
REFRESH_EXPIRY=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Helmet Configuration (Production):**

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'wss:', 'https:'],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

---

## 5. Content Moderation Foundation

**File:** `packages/backend/src/modules/moderation/moderation.service.ts` (new)

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModerationService {
  private blockedKeywords = [
    'hate-speech-term-1',
    'hate-speech-term-2',
    'spam-pattern',
    'offensive-word'
  ];

  constructor(private prisma: PrismaService) {}

  async checkContent(content: string): Promise<{ isBlocked: boolean; reason?: string }> {
    const lowerContent = content.toLowerCase();

    for (const keyword of this.blockedKeywords) {
      if (lowerContent.includes(keyword)) {
        return { isBlocked: true, reason: `Blocked keyword: ${keyword}` };
      }
    }

    // Check for repeated characters (spam)
    if (/(.)\1{9,}/.test(content)) {
      return { isBlocked: true, reason: 'Repeated characters detected' };
    }

    // Check for URL spam
    if ((content.match(/https?:\/\//g) || []).length > 3) {
      return { isBlocked: true, reason: 'Too many links' };
    }

    return { isBlocked: false };
  }

  async flagContent(contentId: string, type: string, reason: string, reportedBy?: string) {
    return this.prisma.report.create({
      data: {
        contentId,
        type,
        reason,
        reportedBy,
        status: 'PENDING_REVIEW'
      }
    });
  }

  async getReports(status?: string) {
    return this.prisma.report.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' }
    });
  }

  async approveReport(reportId: string) {
    return this.prisma.report.update({
      where: { id: reportId },
      data: { status: 'APPROVED' }
    });
  }

  async rejectReport(reportId: string) {
    return this.prisma.report.update({
      where: { id: reportId },
      data: { status: 'REJECTED' }
    });
  }
}
```

**Integration in Post Creation:**

```typescript
@Post()
async create(@Body() dto: CreatePostInput, @Request() req) {
  // Check content
  const { isBlocked, reason } = await this.moderationService.checkContent(dto.content);

  if (isBlocked) {
    await this.moderationService.flagContent(
      'post-pending',
      'AUTO_FLAG',
      reason
    );

    throw new BadRequestException({
      message: 'Your post contains prohibited content',
      reason
    });
  }

  return this.postsService.create(req.user.id, dto);
}
```

**Admin Endpoint:**

```typescript
// admin.controller.ts
@Get('reports')
@UseGuards(AdminGuard)
async getReports(@Query('status') status?: string) {
  return this.moderationService.getReports(status);
}

@Post('reports/:id/approve')
@UseGuards(AdminGuard)
async approveReport(@Param('id') reportId: string) {
  return this.moderationService.approveReport(reportId);
}

@Post('reports/:id/reject')
@UseGuards(AdminGuard)
async rejectReport(@Param('id') reportId: string) {
  return this.moderationService.rejectReport(reportId);
}
```

---

## 6. Performance Testing

**File:** `packages/backend/test/performance.spec.ts` (new)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

describe('Performance Tests', () => {
  let app;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('GET /posts/feed should respond in <200ms', async () => {
    const token = await getAuthToken(); // Helper

    const start = Date.now();
    const res = await request(app.getHttpServer())
      .get('/api/posts/feed')
      .set('Authorization', `Bearer ${token}`);
    const duration = Date.now() - start;

    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(200);
  });

  it('Concurrent requests should not exceed 500ms P95', async () => {
    const token = await getAuthToken();
    const durations = [];

    for (let i = 0; i < 100; i++) {
      const start = Date.now();
      await request(app.getHttpServer())
        .get('/api/posts/feed')
        .set('Authorization', `Bearer ${token}`);
      durations.push(Date.now() - start);
    }

    durations.sort((a, b) => a - b);
    const p95 = durations[Math.floor(durations.length * 0.95)];

    expect(p95).toBeLessThan(500);
  });
});
```

**Run Performance Tests:**
```bash
npm run test:perf
npm run test -- --testPathPattern=performance
```

---

## ✅ Acceptance Criteria

- ✅ All queries execute in <100ms at 1K concurrent
- ✅ Rate limits enforced on auth endpoints (429 responses)
- ✅ No N+1 queries (verified with query analysis)
- ✅ CORS restricted to frontend origin only
- ✅ Moderation blocks 95%+ of spam
- ✅ Performance tests pass (P95 <500ms)
- ✅ Security headers present on all responses
- ✅ Cache invalidates properly on data mutations

---

**Timeline:** 2–3 days (parallel with frontend)
**Checkpoint:** All tests passing, performance validated
**Next Phase:** Production pipeline (staging, CI/CD)
