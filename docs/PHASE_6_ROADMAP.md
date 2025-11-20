# Phase 6: Production Hardening — 4-Week Roadmap

**Target:** Production Readiness 52/100 → 85/100
**Timeline:** 4 weeks (28 days)
**Start Date:** Monday after Phase 5 completion
**Team Size:** 6-8 engineers (Backend, Frontend, DevOps, QA)

---

## Overview: Critical Blockers to Production Launch

Currently, D-A-I-R-A has:
- ✅ Solid backend (NestJS, PostgreSQL, Redis)
- ✅ Auth infrastructure (Zustand + React Query hooks + E2E tests)
- ✅ CI/CD foundation (prisma-wait.sh, GitHub Actions)
- ❌ Frontend performance stack (Next.js + Tailwind not yet implemented)
- ❌ Video infrastructure (HLS transcoding pipeline missing)
- ❌ Regulatory compliance (PDPL licensing not started)
- ❌ Production-grade moderation (keyword filters not deployed)
- ❌ Load testing (no K6 tests or performance baseline)

**This phase removes all 4 blockers.**

---

## Week 1: Frontend Performance Stack (Days 1-7)

### Objective
Replace frontend scaffold with production-ready Next.js + Tailwind stack optimized for Egyptian market (low-end Android, 3G networks).

### Tasks

**Day 1-2: Project Initialization**
```bash
# Create new Next.js project with Tailwind + TypeScript
npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app-dir \
  --no-src-dir

# Install dependencies
cd frontend
npm install zustand @tanstack/react-query zod @hookform/resolvers react-hook-form \
  next-i18n-router next-intl radix-ui @radix-ui/react-dialog

# Verify build
npm run build
```

**Day 3: RTL (Right-to-Left) Setup for Arabic**
```typescript
// next.config.js
module.exports = {
  i18n: {
    locales: ['en', 'ar-EG'],
    defaultLocale: 'en',
  },
};

// app/[locale]/layout.tsx
export default function RootLayout({ params: { locale } }) {
  return (
    <html lang={locale} dir={locale === 'ar-EG' ? 'rtl' : 'ltr'}>
      <body>{children}</body>
    </html>
  );
}
```

**Day 4: Core Pages Structure**
- [ ] `app/[locale]/page.tsx` — Landing page
- [ ] `app/[locale]/auth/login/page.tsx` — Login (reuse `LoginForm.tsx`)
- [ ] `app/[locale]/auth/register/page.tsx` — Register (reuse `RegisterForm.tsx`)
- [ ] `app/[locale]/feed/page.tsx` — Main feed (reuse `Feed.tsx`)
- [ ] `app/[locale]/profile/[username]/page.tsx` — User profile

**Day 5: Performance Optimization**
```typescript
// Implement image optimization
import Image from 'next/image';

<Image
  src="/avatar.jpg"
  alt="User avatar"
  width={48}
  height={48}
  quality={75}
  priority={false}
/>

// Lazy load non-critical components
const CommentThread = dynamic(() => import('@/components/CommentThread'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

**Day 6-7: Performance Testing**
```bash
# Run Lighthouse
npm install -g lighthouse
lighthouse http://localhost:3000

# Expected scores:
# - Performance: >90
# - Accessibility: >95
# - Best Practices: >95
# - SEO: >95

# Test on 3G throttle
# DevTools → Network → Slow 3G
# - First Contentful Paint (FCP): <1.5s target
# - Time to Interactive (TTI): <2.5s target
```

**Deliverables:**
- Next.js project with Tailwind CSS
- RTL support for Arabic
- 5 core pages implemented
- Lighthouse score >90
- Performance budget (<100KB JS)

---

## Week 2: Media Infrastructure (Days 8-14)

### Objective
Implement HLS video transcoding pipeline to deliver adaptive bitrate video to Egyptian users on unstable networks.

### Architecture
```
User Upload (web form)
    ↓
tus.io (resumable upload to S3 temp bucket)
    ↓
Webhook: BullMQ job created
    ↓
FFmpeg Worker (separate microservice)
    ├─ Transcode to HLS
    ├─ Generate bitrate ladder (240p, 480p, 720p)
    ├─ Create thumbnail
    └─ Move to public S3 bucket
    ↓
Frontend notified (Socket.IO)
    ↓
Video ready for playback via adaptive player
```

### Tasks

**Day 8-9: Backend Media Service & Job Queue**
```typescript
// backend/src/modules/media/media.service.ts
import { BullModule } from '@nestjs/bull';
import { Queue } from 'bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'video-transcoding',
      redis: { host: 'localhost', port: 6379 },
    }),
  ],
})
export class MediaModule {}

// backend/src/modules/media/transcoding.worker.ts
@Processor('video-transcoding')
export class TranscodingWorker {
  @Process()
  async transcode(job: Job<{ videoId: string; inputPath: string }>) {
    // 1. Download from S3
    // 2. Run FFmpeg
    // 3. Upload HLS files
    // 4. Notify frontend
  }
}
```

**Day 10: FFmpeg Transcoding Command**
```typescript
// Bitrate ladder for Egypt
const bitrateLadder = [
  { name: 'low', resolution: '240x135', bitrate: '400k' },
  { name: 'medium', resolution: '480x270', bitrate: '800k' },
  { name: 'high', resolution: '720x404', bitrate: '1500k' },
];

// FFmpeg command
const command = `
  ffmpeg -i input.mp4 \
    -c:v libx264 -preset medium -crf 23 \
    -c:a aac -b:a 128k \
    -f hls -hls_time 10 -hls_list_size 0 \
    -hls_segment_filename 'stream-%d.ts' \
    stream.m3u8
`;
```

**Day 11: Video Upload Component**
```typescript
// web/src/components/VideoUpload.tsx
import { useTus } from 'use-tus';

export function VideoUpload() {
  const { upload } = useTus({
    endpoint: '/api/media/upload',
    onSuccess: (response) => {
      // Emit event to backend to start transcoding
      socket.emit('transcoding:start', { videoId: response.id });
    },
  });

  return (
    <input
      type="file"
      accept="video/*"
      onChange={(e) => upload(e.target.files[0])}
    />
  );
}
```

**Day 12-13: Video Player Component**
```typescript
// web/src/components/VideoPlayer.tsx
import HLS from 'hls.js';

export function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const hls = new HLS();
    hls.loadSource(videoUrl); // m3u8 playlist
    hls.attachMedia(videoRef.current);

    // ABR automatically selects best quality based on network
    hls.on(HLS.Events.hlsManifestParsed, () => {
      videoRef.current?.play();
    });

    return () => hls.destroy();
  }, [videoUrl]);

  return <video ref={videoRef} controls width="100%" />;
}
```

**Day 14: Testing & Validation**
- [ ] Upload video via web UI
- [ ] Verify job enqueued in BullMQ
- [ ] Monitor FFmpeg worker logs
- [ ] Check HLS output in S3
- [ ] Verify adaptive bitrate switching in browser

**Deliverables:**
- BullMQ job queue for transcoding
- FFmpeg command with bitrate ladder
- Video upload component with tus.io
- HLS video player component
- End-to-end video upload → transcoding → playback flow

---

## Week 3: PDPL Compliance & Content Moderation (Days 15-21)

### Objective
Implement regulatory compliance for Egyptian market (PDPL) and deploy content moderation to prevent toxic content.

### Tasks

**Day 15: PDPL Compliance Framework**
```typescript
// backend/src/modules/compliance/compliance.service.ts
export class ComplianceService {
  // User consent tracking
  async recordUserConsent(userId: string, consentType: string) {
    return this.prisma.userConsent.create({
      data: { userId, consentType, timestamp: new Date() },
    });
  }

  // Right to be forgotten (delete account)
  async deleteUserData(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // 1. Delete personal data
    await this.prisma.user.delete({ where: { id: userId } });

    // 2. Anonymize posts (don't delete, keep for audit)
    await this.prisma.post.updateMany({
      where: { authorId: userId },
      data: { authorId: null, authorName: 'Deleted User' },
    });

    // 3. Log deletion for DPO audit trail
    await this.auditLog.create({
      action: 'USER_DELETED',
      userId,
      timestamp: new Date(),
    });
  }
}
```

**Day 16-17: Content Moderation - Keyword Filter**
```typescript
// backend/src/modules/moderation/moderation.service.ts
import Redis from 'ioredis';

export class ModerationService {
  constructor(private redis: Redis) {
    // Load banned keywords into Redis Bloom Filter
    this.initializeBloomFilter();
  }

  async initializeBloomFilter() {
    const bannedKeywords = [
      // Egyptian slang profanity
      'حرام', 'وسخ', 'ملعون',
      // Franco-Arabic
      '3erfan', 'weskh', 'mo7ram',
      // Hate speech
      'إرهابي', '3irhabi',
    ];

    for (const keyword of bannedKeywords) {
      await this.redis.bfadd('moderation:keywords', keyword);
    }
  }

  async checkContent(content: string): Promise<boolean> {
    const words = content.split(' ');
    for (const word of words) {
      const exists = await this.redis.bfexists('moderation:keywords', word);
      if (exists) return true; // Banned content
    }
    return false; // OK
  }
}
```

**Day 18: AI Moderation - MarBERT Integration**
```typescript
// backend/src/modules/moderation/marbert.service.ts
import { pipeline } from '@xenova/transformers';

export class MarBERTService {
  private classifier: any;

  constructor() {
    // Load pre-trained Egyptian Arabic hate speech model
    this.classifier = pipeline(
      'text-classification',
      'IbrahimAmin/marbertv2-finetuned-egyptian-hate-speech-detection'
    );
  }

  async classifyText(text: string) {
    const result = await this.classifier(text);
    return {
      label: result[0].label, // 'LABEL_0' (OK), 'LABEL_1' (Hate)
      score: result[0].score, // 0-1 confidence
    };
  }
}

// Usage in Post creation
async createPost(content: string, authorId: string) {
  // Layer 1: Keyword check (fast)
  if (await this.moderation.checkContent(content)) {
    throw new BadRequestException('Content contains banned words');
  }

  // Layer 2: AI classification (async)
  const classification = await this.marbert.classifyText(content);

  const post = await this.prisma.post.create({
    data: { content, authorId, status: 'PUBLISHED' },
  });

  // If confidence >70%, flag for review
  if (classification.score > 0.7) {
    await this.queue.add('moderation:review', { postId: post.id });
  }

  return post;
}
```

**Day 19: Admin Dashboard - Content Review**
```typescript
// backend/src/modules/admin/moderation.controller.ts
@Controller('admin/moderation')
@UseGuards(AuthGuard, RoleGuard('ADMIN'))
export class ModerationController {
  @Get('flagged')
  async getFlaggedContent(@Query() { status, limit = 20, offset = 0 }) {
    return this.prisma.post.findMany({
      where: { status: 'FLAGGED' },
      take: limit,
      skip: offset,
    });
  }

  @Post('approve/:postId')
  async approvePost(@Param('postId') postId: string) {
    return this.prisma.post.update({
      where: { id: postId },
      data: { status: 'PUBLISHED', reviewedAt: new Date() },
    });
  }

  @Post('reject/:postId')
  async rejectPost(@Param('postId') postId: string, @Body() { reason }) {
    await this.prisma.post.update({
      where: { id: postId },
      data: { status: 'REJECTED', rejectionReason: reason },
    });

    // Notify user
    await this.notifications.send(
      post.authorId,
      `Your post was rejected: ${reason}`
    );
  }
}
```

**Day 20-21: Deployment & Testing**
- [ ] PDPL Privacy Policy drafted (legal team)
- [ ] Terms of Service updated
- [ ] Delete Account flow tested
- [ ] Keyword blocker deployed
- [ ] MarBERT model tested on sample posts
- [ ] Admin review dashboard tested

**Deliverables:**
- PDPL compliance framework (data deletion, consent tracking)
- Keyword filter (Redis Bloom Filter)
- AI moderation (MarBERT for Egyptian Arabic)
- Admin content review dashboard
- Audit trail for regulatory compliance

---

## Week 4: Load Testing & Production Optimization (Days 22-28)

### Objective
Validate system can handle production load (10,000+ concurrent users) and optimize bottlenecks.

### Tasks

**Day 22-23: Setup K6 Load Testing**
```bash
# Install K6
brew install k6

# Create k6 test script
cat > tests/load-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Ramp up
    { duration: '3m', target: 1000 },  // Stay
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95th percentile under 500ms
    http_req_failed: ['rate<0.1'],     // Error rate under 0.1%
  },
};

export default function () {
  // Login
  let response = http.post('http://localhost:3000/api/auth/login', {
    email: `user${__VU}@test.com`,
    password: 'TestPassword123',
  });

  check(response, {
    'login success': (r) => r.status === 200,
  });

  // Get feed
  response = http.get('http://localhost:3000/api/posts/feed', {
    headers: { Authorization: `Bearer ${JSON.parse(response.body).accessToken}` },
  });

  check(response, {
    'feed success': (r) => r.status === 200,
    'feed p95 < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
EOF

# Run test
k6 run tests/load-test.js
```

**Day 24: Database Query Optimization**
```sql
-- Analyze slow queries
EXPLAIN ANALYZE
SELECT p.* FROM posts p
JOIN follows f ON p.author_id = f.following_id
WHERE f.follower_id = '123'
ORDER BY p.created_at DESC
LIMIT 20;

-- Add missing indexes
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX idx_follows_follower ON follows(follower_id, following_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);

-- Verify improvements
EXPLAIN ANALYZE (same query as above);
```

**Day 25: Redis Memory Tuning**
```bash
# Monitor Redis memory
redis-cli info memory

# Optimize memory policies
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Monitor key evictions
redis-cli --latency
redis-cli --bigkeys

# Set expiration on temporary data
redis-cli EXPIRE "session:abc123" 3600  # 1 hour
```

**Day 26: Performance Profiling**
```bash
# Node.js CPU profiling
node --prof --prof-process app.js > app.log

# Analyze GC pauses
node --trace-gc --trace-gc-verbose app.js

# Memory leak detection
node --inspect app.js
# Open chrome://inspect to debug
```

**Day 27: Load Test Validation**
```bash
# Run full load test suite
k6 run tests/load-test.js --vus 1000 --duration 5m

# Expected results:
# - P95 latency: <500ms ✓
# - Error rate: <0.1% ✓
# - Memory stable: <2GB ✓
# - CPU usage: <80% ✓

# If failures, iterate:
# 1. Add database indexes
# 2. Increase Redis cache TTL
# 3. Scale horizontally (multiple instances)
```

**Day 28: Documentation & Runbook**
- [ ] Create "How to Run Load Tests" doc
- [ ] Document performance baselines
- [ ] Create scaling playbook (when to add instances)
- [ ] Setup monitoring dashboards (Prometheus/Grafana)
- [ ] Deploy to staging and verify under load

**Deliverables:**
- K6 load tests (1,000+ concurrent users)
- Database performance baseline
- Redis optimization settings
- Performance runbook
- Monitoring dashboards

---

## Success Criteria (End of Week 4)

### Frontend Performance ✅
- [ ] Lighthouse score >90 on all pages
- [ ] First Contentful Paint (FCP) <1.5s on 3G
- [ ] Time to Interactive (TTI) <2.5s
- [ ] Bundle size <100KB (gzipped)
- [ ] RTL (Arabic) interface fully functional

### Video Infrastructure ✅
- [ ] Video upload completes successfully
- [ ] FFmpeg transcoding to HLS works
- [ ] Bitrate ladder (240p, 480p, 720p) generated
- [ ] Adaptive bitrate player switches quality based on network
- [ ] Video thumbnail auto-generated

### Compliance & Moderation ✅
- [ ] PDPL Privacy Policy deployed
- [ ] Data deletion flow works (GDPR right to be forgotten)
- [ ] Keyword filter blocks banned content
- [ ] MarBERT AI flags hate speech (>70% confidence)
- [ ] Admin dashboard can review/approve/reject posts

### Load Testing ✅
- [ ] K6 test simulates 1,000 concurrent users
- [ ] P95 latency <500ms under load
- [ ] Error rate <0.1%
- [ ] Memory stable (no leaks)
- [ ] Database indexes optimized
- [ ] Ready for production scaling

---

## Production Readiness Score After Phase 6

| Category | Before | After | Target |
|----------|--------|-------|--------|
| **Frontend** | 35/100 | 85/100 | 85/100 ✓ |
| **Video** | 0/100 | 80/100 | 85/100 |
| **Compliance** | 25/100 | 85/100 | 95/100 |
| **Performance** | 40/100 | 80/100 | 85/100 |
| **Security** | 60/100 | 75/100 | 90/100 |
| **Backend** | 75/100 | 85/100 | 85/100 ✓ |
| **Overall** | 52/100 | **81/100** | 85/100 |

**Target:** 81/100 by end of Week 4 (ready for public launch)

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Next.js bundle bloats | Medium | High | Strict performance budget checks each build |
| FFmpeg transcoding fails | Medium | High | Retry logic + fallback quality (stream as-is) |
| MarBERT model misclassifies | High | Medium | Human-in-the-loop review for 50-90% confidence |
| Load test shows bottleneck | Medium | High | Pre-optimize indexes, cache strategy |
| PDPL licensing delayed | Low | Critical | Start application in parallel (Week 1) |

---

**Next Update:** End of Phase 6 (Week 4)
**Stakeholder Sync:** Every Friday 3 PM UTC
