# D-A-I-R-A Platform Architecture - Phase 1 & Phase 2

## Visual Architecture Stack

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                 PHASE 3: NERVOUS SYSTEM (PLANNED)              ┃
┃                   REST API, GraphQL, WebSocket                 ┃
┃              Controllers, Resolvers, Gateway Layer             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                  ↑
                                  │
                          (serves data through)
                                  │
                                  ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃           PHASE 2: SKELETAL SYSTEM (JUST COMPLETED)           ┃
┃                  Data Persistence & Optimization               ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                 ┃
┃  ┌─────────────────────┐  ┌─────────────────────┐             ┃
┃  │   PRISMA ORM        │  │  QUERY OPTIMIZATION │             ┃
┃  │                     │  │                     │             ┃
┃  │ • 50+ tables        │  │ • Batch loading     │             ┃
┃  │ • Type-safe client  │  │ • Partial hydration │             ┃
┃  │ • Relationships     │  │ • Keyset pagination │             ┃
┃  │ • Transactions      │  │ • Aggregations      │             ┃
┃  └─────────────────────┘  └─────────────────────┘             ┃
┃                                                                 ┃
┃  ┌─────────────────────┐  ┌─────────────────────┐             ┃
┃  │  CONNECTION POOL    │  │   REDIS CACHE       │             ┃
┃  │                     │  │                     │             ┃
┃  │ • 10-50 conns      │  │ • Sessions (24h)    │             ┃
┃  │ • Auto-scaling      │  │ • Feeds (1h)        │             ┃
┃  │ • Health monitoring │  │ • Profiles (1h)     │             ┃
┃  │ • Slow queries      │  │ • Vectors (30d)     │             ┃
┃  │ • Stats tracking    │  │ • Rate limits (1m)  │             ┃
┃  └─────────────────────┘  └─────────────────────┘             ┃
┃                                                                 ┃
┃  ┌─────────────────────┐  ┌─────────────────────┐             ┃
┃  │  SCHEMA VALIDATION  │  │   INITIALIZATION    │             ┃
┃  │                     │  │                     │             ┃
┃  │ • 20+ DTOs          │  │ • Auto-migration    │             ┃
┃  │ • Type-safe         │  │ • Seed data         │             ┃
┃  │ • class-validator   │  │ • Index creation    │             ┃
┃  │ • Auto-docs         │  │ • Health checks     │             ┃
┃  └─────────────────────┘  └─────────────────────┘             ┃
┃                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                  ↑
                                  │
                          (routes events through)
                                  │
                                  ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃          PHASE 1: CIRCULATORY SYSTEM (COMPLETED)               ┃
┃          Event-Driven & Real-Time Communication                ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                 ┃
┃  ┌─────────────────────┐  ┌─────────────────────┐             ┃
┃  │    EVENT BUS        │  │   REAL-TIME HUB     │             ┃
┃  │   (BullMQ)          │  │  (Redis Pub/Sub)    │             ┃
┃  │                     │  │                     │             ┃
┃  │ • 18 queues         │  │ • <10ms latency     │             ┃
┃  │ • Priorities        │  │ • Presence tracking │             ┃
┃  │ • DLQ handling      │  │ • Typing indicators │             ┃
┃  │ • 10k evt/sec       │  │ • Chat & notify     │             ┃
┃  └─────────────────────┘  └─────────────────────┘             ┃
┃                                                                 ┃
┃  ┌─────────────────────────────────────────────────────────┐  ┃
┃  │  EVENT HANDLERS & MIDDLEWARE                            │  ┃
┃  │                                                           │  ┃
┃  │ • 40+ event handlers                                    │  ┃
┃  │ • Correlation ID tracing (req → response)              │  ┃
┃  │ • Circuit breaker (fault tolerance)                    │  ┃
┃  │ • Deduplication (idempotency)                          │  ┃
┃  │ • Batch operations                                      │  ┃
┃  │ • Rate limiting                                         │  ┃
┃  └─────────────────────────────────────────────────────────┘  ┃
┃                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                  ↑
                                  │
                          (persists to)
                                  │
                                  ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃            INFRASTRUCTURE & DATA LAYER                         ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                 ┃
┃  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           ┃
┃  │ PostgreSQL  │  │    Redis    │  │  Storage    │           ┃
┃  │ (Primary)   │  │ (Cache/RT)  │  │  (R2/S3)    │           ┃
┃  │             │  │             │  │             │           ┃
┃  │ • 50+ tbl   │  │ • Sessions  │  │ • Videos    │           ┃
┃  │ • ACID      │  │ • Feeds     │  │ • Images    │           ┃
┃  │ • Scaling   │  │ • Vectors   │  │ • Backups   │           ┃
┃  │ • 16GB+ RAM │  │ • Rate lim  │  │ • CDN ready │           ┃
┃  └─────────────┘  └─────────────┘  └─────────────┘           ┃
┃                                                                 ┃
┃  Additional (Future):                                          ┃
┃  • Qdrant (vector embeddings) - Phase 2.2                     ┃
┃  • ScyllaDB (high-velocity writes) - Phase 2.2                ┃
┃  • Milvus (AI recommendations) - Phase 4                      ┃
┃                                                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## Phase 1 & Phase 2 Integration

```
USER REQUEST (e.g., Upload Video)
              ↓
     ┌────────────────────────┐
     │  MIDDLEWARE (Phase 1)  │
     │ • Assign Correlation  │
     │   ID for tracing      │
     └────────────────────────┘
              ↓
     ┌────────────────────────────────────┐
     │   CONTROLLER (Phase 3 - future)    │
     │ • Validate request                 │
     │ • Check auth                       │
     └────────────────────────────────────┘
              ↓
     ┌────────────────────────────────────┐
     │  SERVICE (Business Logic)          │
     │ • 1. Save video to S3              │
     │ • 2. Create DB record via Prisma   │ ← Phase 2
     │ • 3. Publish event                 │ ← Phase 1
     └────────────────────────────────────┘
              ↓
     ┌────────────────────────────────────┐
     │  PRISMA (Phase 2)                  │
     │ • Save video metadata              │
     │ • Use connection pool              │
     │ • Cache in Redis                   │
     │ • Return created video             │
     └────────────────────────────────────┘
              ↓
     ┌────────────────────────────────────┐
     │  EVENT BUS (Phase 1)               │
     │ • Route 'video.uploaded' event     │
     │ • 18 queues (priority-based)       │
     └────────────────────────────────────┘
              ↓
     ┌─────────────────────────────────────────┐
     │  PARALLEL WORKERS (Phase 1)             │
     │ • Transcode (FFmpeg)                    │
     │ • Fan-out to followers (via cache)      │ ← Phase 2
     │ • Generate vectors                      │
     │ • Update analytics                      │
     │ • Notify followers (real-time)          │ ← Phase 1
     └─────────────────────────────────────────┘
              ↓
     ┌────────────────────────────────────┐
     │  REAL-TIME (Phase 1)               │
     │ • Pub/Sub to followers             │
     │ • <10ms latency                    │
     └────────────────────────────────────┘
              ↓
CLIENT RECEIVES: { status: "processing", id: "xyz" }
```

---

## Database Schema by Domain

```
USERS (001)
├── User (15 cols)
│   ├─ email, phone, username
│   ├─ password_hash, avatar_url
│   ├─ is_verified, status, created_at
│   └─ [Relations: profile, sessions, posts, videos, follows, wallet]
├── UserProfile (8 cols)
│   ├─ display_name, bio, location
│   ├─ followers_count, following_count, trust_score, badges
│   └─ [PK: user_id]
└── UserSession (8 cols)
    ├─ refresh_token (unique), access_token
    ├─ device_type, ip_address, expires_at
    └─ [PK: user_id, token]

CONTENT (002)
├── Post (9 cols)
│   ├─ content, media_urls[], hashtags[], mentions[]
│   ├─ likes_count, comments_count, status
│   └─ [Relations: author, comments, likes]
├── Video (12 cols)
│   ├─ title, description, thumbnail_url
│   ├─ hls_url, duration, resolution, views_count
│   ├─ status (UPLOADING→PROCESSING→PUBLISHED)
│   ├─ embeddings[] (for AI)
│   └─ [Relations: author, comments, likes]
└── Comment (8 cols)
    ├─ content, parent_id (for threading)
    ├─ likes_count, mentions[]
    └─ [Relations: author, post/video, replies]

SOCIAL (003)
├── Follow (4 cols) - Unique [follower_id, followee_id]
│   ├─ follower_id → User
│   ├─ followee_id → User
│   └─ status (ACTIVE | PENDING)
├── Block (4 cols) - Unique [blocker_id, blocked_id]
│   ├─ blocker_id → User
│   ├─ blocked_id → User
│   └─ reason
├── Mute (4 cols) - Unique [muter_id, muted_id]
│   └─ mute_type (MUTE | HIDE_STORIES | HIDE_POSTS)
└── Like (5 cols) - Polymorphic
    ├─ user_id, post_id/video_id/comment_id (one must exist)
    ├─ reaction (LIKE | LOVE | LAUGH | SAD | ANGRY)
    └─ Unique on [user_id, post_id], [user_id, video_id], etc.

PAYMENTS (004)
├── Wallet (8 cols)
│   ├─ user_id (unique), balance, currency
│   ├─ earned_total, spent_total, tips_received
│   └─ last_payout_at
├── Transaction (10 cols)
│   ├─ wallet_id, type (DEPOSIT|WITHDRAWAL|TIP|EARNING|REFUND)
│   ├─ amount, currency, status (PENDING|COMPLETED|FAILED)
│   ├─ description, metadata (JSON)
│   └─ created_at, completed_at
└── Payment (10 cols)
    ├─ transaction_id, external_id (Stripe/Paypal)
    ├─ provider (STRIPE|PAYPAL|FAWRY|INSTAPAY)
    ├─ amount, currency, status
    ├─ error_message, metadata
    └─ created_at, updated_at

MODERATION (005)
├── ContentReport (10 cols)
│   ├─ content_id, content_type (POST|VIDEO|COMMENT|USER)
│   ├─ reporter_id → User
│   ├─ reason (SPAM|HARASSMENT|HATE_SPEECH|VIOLENCE)
│   ├─ severity (LOW|MEDIUM|HIGH|CRITICAL), status
│   ├─ description, evidence_urls[]
│   └─ created_at
├── ModerationReview (6 cols)
│   ├─ report_id (unique) → ContentReport
│   ├─ reviewer_id, decision (APPROVED|REJECTED|WARN|SUSPEND|BAN)
│   ├─ reason, action_taken
│   └─ created_at
└── AuditLog (8 cols)
    ├─ admin_id, action (USER_BANNED|CONTENT_DELETED|etc)
    ├─ resource_type (USER|CONTENT|SYSTEM), resource_id
    ├─ changes (JSONB), reason
    ├─ ip_address, user_agent
    └─ created_at
```

---

## Caching Strategy (Phase 2)

```
Redis Multi-Tier Cache
│
├─ Session Cache (TTL: 24h)
│  ├─ Key: session:{user_id}
│  ├─ Value: { token, refresh_token, device_type, ... }
│  └─ Hit rate: 95% (most requests require session)
│
├─ Feed Cache (TTL: 1h)
│  ├─ Key: feed:{user_id}
│  ├─ Value: [post_id_1, post_id_2, ...] (Redis LIST)
│  ├─ Max: 1,000 posts per user
│  └─ Hit rate: 80% (feed refresh cycle)
│
├─ Profile Cache (TTL: 1h, invalidatable)
│  ├─ Key: profile:{user_id}
│  ├─ Value: { display_name, avatar_url, followers, ... }
│  ├─ Invalidate on: profile update, follow/unfollow
│  └─ Hit rate: 85%
│
├─ Vector Cache (TTL: 30 days)
│  ├─ Key: vector:{user_id}
│  ├─ Value: [0.12, 0.34, 0.56, ...] (embeddings)
│  ├─ Used for: AI recommendations
│  └─ Hit rate: 90% (stable over time)
│
├─ Rate Limit (TTL: 1m-1h sliding window)
│  ├─ Key: ratelimit:{user_id}:{endpoint}
│  ├─ Value: { count, window_start }
│  ├─ Algorithm: Sliding window counter
│  └─ Hit rate: 100% (all requests checked)
│
├─ Analytics (TTL: 24h)
│  ├─ Key: analytics:{type}:{bucket}
│  ├─ Value: { views, likes, engagement, ... }
│  ├─ Batch updated hourly
│  └─ Hit rate: 70% (aggregated from stream)
│
└─ Generic K/V (TTL: custom)
   ├─ Key: custom:{namespace}:{id}
   ├─ Value: any JSON
   ├─ TTL: configurable per key
   └─ Hit rate: depends on usage
```

---

## Query Optimization Patterns

```
PATTERN 1: Batch Loading (Avoid N+1)
─────────────────────────────────────

❌ WRONG (N+1):
for (post of posts) {
  const author = await db.user.findOne(post.author_id)  // 100 queries!
}

✅ RIGHT (Batch):
const authorIds = posts.map(p => p.author_id)
const authors = await prisma.getMultipleUsers(authorIds)  // 1 query!
const authorMap = new Map(authors.map(a => [a.id, a]))
for (post of posts) {
  const author = authorMap.get(post.author_id)
}


PATTERN 2: Partial Hydration (Select Fields)
──────────────────────────────────────────────

❌ WRONG (All fields):
const users = await db.user.findMany()  // 30 columns per row
// User: { id, email, username, password_hash, avatar_url, bio, location, ... }

✅ RIGHT (Only needed):
const users = await prisma.user.findMany({
  select: { id: true, username: true, avatar_url: true }  // 3 columns!
})


PATTERN 3: Keyset Pagination (Not Offset)
──────────────────────────────────────────

❌ WRONG (Offset - O(N) complexity):
SELECT * FROM posts OFFSET 1000 LIMIT 20
// Scans 1000 rows then takes 20

✅ RIGHT (Keyset - O(1) complexity):
SELECT * FROM posts WHERE id > '999' ORDER BY id LIMIT 20
// Uses index directly, starts at cursor


PATTERN 4: Aggregation (Batch Stats)
─────────────────────────────────────

❌ WRONG (N queries):
const followers = await db.follow.count({ where: { followee_id } })
const following = await db.follow.count({ where: { follower_id } })
const posts = await db.post.count({ where: { author_id } })

✅ RIGHT (1 query):
const stats = await prisma.getUserStats(userId)
// Returns: { followers, following, posts, videos, likes }


PATTERN 5: Indexes (Query Speed)
──────────────────────────────────

✅ INDEXED (Fast):
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at DESC)
SELECT * FROM posts WHERE author_id = $1 ORDER BY created_at DESC

✅ INDEXED (Fast):
CREATE INDEX idx_users_email ON users(email)
SELECT * FROM users WHERE email = $1

❌ NOT INDEXED (Slow):
SELECT * FROM users WHERE bio LIKE '%keyword%'  // Full table scan!
```

---

## Performance Targets

| Operation | Current | Target | Optimization |
|-----------|---------|--------|--------------|
| User lookup | <5ms | <5ms | ✅ Indexed |
| Search users (20) | 20-30ms | 15-25ms | ✅ Full-text ready |
| Load feed (20 posts) | 30-50ms | 20-40ms | ✅ Redis cache |
| Batch load 100 users | 50-80ms | 30-60ms | ✅ Single query |
| User stats aggregation | 60-100ms | 40-80ms | ✅ Batch query |
| Trending videos | 80-150ms | 50-120ms | ✅ Keyset pagination |

---

## Deployment Topology

```
LOAD BALANCER
    ↓
┌─────────────────────────┐
│  NestJS App (replicas)  │  ← Request handling
│  • Phase 1: Circulatory │     • Event emission
│  • Phase 2: Skeletal    │     • DB operations
│  • Phase 3: Nervous     │     • Real-time updates
│  (3-5 instances)        │
└─────────────────────────┘
    ↓              ↓              ↓
    │              │              │
    ├─────────┬────┴────┬────────┤
    ↓         ↓         ↓        ↓
PostgreSQL  Redis    BullMQ   Storage
(Primary)   (Cache)  (Queue)  (R2/S3)
  (16GB)     (8GB)    (shared) (unlimited)
   │         │        │        │
   └─ Connection Pool: 10-50 connections/instance
   └─ Read Replicas for scaling reads
   └─ Backup: Daily snapshots
```

---

## Files Overview

```
d:\D-A-I-R-A\
├── docs/
│   └── PHASE_2_SKELETAL_SYSTEM.md (1,500+ lines)
├── packages/backend/
│   ├── prisma/
│   │   └── schema.prisma (778 lines)
│   └── src/lib/database/
│       ├── prisma.service.ts (450+ lines)
│       ├── query-optimization.service.ts (400+ lines)
│       ├── database-pool.service.ts (180 lines)
│       ├── redis-cache.service.ts (480 lines)
│       ├── migrations.ts (450+ lines)
│       ├── database-initialization.service.ts (350+ lines)
│       ├── schema-validation.dto.ts (600+ lines)
│       ├── database.module.ts (30 lines)
│       ├── index.ts (15 lines)
│       └── APP_MODULE.guide.ts (400+ lines)
├── PHASE_2_COMPLETION_SUMMARY.md
├── PHASE_2_INTEGRATION_CHECKLIST.md
└── COMMIT_PHASE_2.sh
```

---

**Created**: Phase 1 & Phase 2 Implementation
**Status**: ✅ COMPLETE
**Next**: Phase 3 - Nervous System (API Layer)
