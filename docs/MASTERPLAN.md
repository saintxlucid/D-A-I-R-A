# 🌟 D-A-I-R-A UNIFIED MASTERPLAN

**Status:** November 20, 2025 | **Current Phase:** Identity-Auth Complete | **Next Phase:** Frontend Core + API Hardening

---

## 📋 Table of Contents
1. [Phase Overview](#phase-overview)
2. [Immediate Next (7–10 Days)](#immediate-next-7–10-days)
3. [Phase 1: MVP Hardening (2–3 Weeks)](#phase-1-mvp-hardening)
4. [Phase 2: Beta Stage (3–4 Weeks)](#phase-2-beta-stage)
5. [Phase 3: Public Launch (4–6 Weeks)](#phase-3-public-launch)
6. [Architecture Evolution](#architecture-evolution)
7. [Scaling Strategy](#scaling-strategy)

---

## 🎯 Phase Overview

| Phase | Duration | Goal | Unlock |
|-------|----------|------|--------|
| **Immediate** | 7–10 days | Frontend Core + API Hardening | Testable platform |
| **Phase 1** | 2–3 weeks | MVP Hardening | Beta-ready |
| **Phase 2** | 3–4 weeks | Beta Features | Public launch candidate |
| **Phase 3** | 4–6 weeks | Video + Monetization | Production scale |

**Total to Production:** ~12–16 weeks from now (March 2026)

---

## ⏱️ IMMEDIATE NEXT (7–10 Days)

**Goal:** Make the platform usable and deployable to staging

### A. Frontend Core — Auth + Feed UI
**Deliverables:**
- ✅ Complete React + Vite + Zustand structure
- ✅ Login page (email/password)
- ✅ Register page (email/password confirmation)
- ✅ Forgot password page
- ✅ Password reset flow
- ✅ Silent token refresh (10–12 min intervals)
- ✅ Logout with cleanup
- ✅ Protected routes with token rotation
- ✅ Navbar + Sidebar layout
- ✅ Feed container (placeholder for posts)
- ✅ User profile page (stub)

**Time Estimate:** 3–4 days
**Team:** Frontend Lead + 1 Engineer
**Acceptance Criteria:**
- All auth pages fully functional
- Token refresh working silently
- No 401 errors on page reload
- Feed layout responsive (mobile + desktop)

---

### B. API Hardening

**Database Indexes:**
```sql
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_follow_follower ON "Follow"(followerId);
CREATE INDEX idx_follow_following ON "Follow"(followingId);
CREATE INDEX idx_post_author ON "Post"(authorId);
CREATE INDEX idx_post_created ON "Post"(createdAt DESC);
CREATE INDEX idx_post_updated ON "Post"(updatedAt DESC);
CREATE INDEX idx_comment_post ON "Comment"(postId);
CREATE INDEX idx_like_post ON "Like"(postId);
```

**DTO Validation (Zod):**
- Email format validation
- Password strength (min 8 chars, 1 upper, 1 number, 1 special)
- Username alphanumeric + underscore only
- Post content max 280 chars
- Comment content max 500 chars

**Rate Limiting (Redis-based):**
- Auth endpoints: 5 req/min per IP
- API endpoints: 100 req/min per user
- Media upload: 10 uploads/hour per user

**Security Headers:**
- CORS (frontend origin only)
- Helmet.js (CSP, X-Frame-Options, etc.)
- HSTS (1 year)
- X-Content-Type-Options: nosniff

**Time Estimate:** 2–3 days
**Team:** Backend Tech Lead + 1 Engineer
**Acceptance Criteria:**
- All queries run <100ms at 1K concurrent users
- Rate limits enforced with 429 responses
- No N+1 queries (verified with Prisma studio)

---

### C. Content Moderation Foundation

**Simple Keyword Blocklist:**
```typescript
// Middleware that checks post/comment content
const blockedKeywords = ["profanity", "hate-speech", "spam-patterns"];

if (blockedKeywords.some(kw => content.toLowerCase().includes(kw))) {
  // Flag for review, don't publish
  await prisma.report.create({
    data: {
      type: "AUTO_FLAG",
      reason: "Blocked keyword",
      contentId: post.id,
      status: "PENDING_REVIEW"
    }
  });
}
```

**Database Schema:**
```prisma
model Report {
  id String @id @default(cuid())
  type String // AUTO_FLAG, USER_REPORT
  reason String
  contentId String // post or comment ID
  reportedBy String? // user ID if user-reported
  status String // PENDING_REVIEW, APPROVED, REJECTED
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Admin Endpoint:**
- `GET /admin/reports` — paginated, filterable
- `POST /admin/reports/:id/approve` — publish content
- `POST /admin/reports/:id/reject` — hide content + notify user

**Time Estimate:** 1–2 days
**Team:** Backend Engineer
**Acceptance Criteria:**
- Blocklist prevents ~95% of spam
- Admin can review + approve/reject in <2 sec
- Users notified when content rejected

---

### D. Production Pipeline Prep

**Multi-stage Dockerfile:**
```dockerfile
# Stage 1: Build
FROM node:20-alpine as builder
WORKDIR /app
COPY pnpm-lock.yaml .
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

**Staging Environment Template:**
- Namespace: daira-staging
- Postgres: Persistent volume (20GB)
- Redis: 1-node cluster
- Backend: 2 replicas, rolling updates
- Frontend: 2 replicas, canary deployment
- Monitoring: Prometheus + Grafana
- Logs: Loki aggregation

**CI/CD Enhancement:**
- Run linting + formatting check
- Run unit tests + E2E smoke tests
- Build Docker image + push to registry
- Deploy to staging if all tests pass
- Run smoke tests against staging
- Require manual approval for prod deploy

**Time Estimate:** 2–3 days
**Team:** DevOps Lead
**Acceptance Criteria:**
- Deploy time <5 minutes
- Zero downtime rolling updates
- Smoke tests pass 100% on staging
- Metrics visible in Grafana

---

## 🟩 PHASE 1: MVP HARDENING (2–3 Weeks)

**Goal:** Ship a cohesive, usable platform ready for closed beta

### Frontend Layer (Complete User Experience)

| Component | Status | Estimate |
|-----------|--------|----------|
| Auth pages (✅ done) | Complete | — |
| Feed UI + infinite scroll | 2 days | 1 FE Engineer |
| Create post modal | 1 day | 1 FE Engineer |
| Post detail page | 1.5 days | 1 FE Engineer |
| Comments thread | 1.5 days | 1 FE Engineer |
| Like/comment interactions | 1 day | 1 FE Engineer |
| User profile page | 2 days | 1 FE Engineer |
| Follow/unfollow UX | 0.5 day | 1 FE Engineer |
| Error boundaries + loading states | 1 day | 1 FE Engineer |
| Dark mode (Tailwind) | 0.5 day | 1 FE Engineer |
| **Subtotal** | — | **~11 days** |

### Backend Layer (API Completion)

| Component | Status | Estimate |
|-----------|--------|----------|
| Password reset flow | 1 day | 1 BE Engineer |
| Email verification | 1 day | 1 BE Engineer |
| Moderation pipeline (auto + manual) | 2 days | 1 BE Engineer |
| Admin minimal panel API | 1.5 days | 1 BE Engineer |
| Structured logging (Pino) | 0.5 day | 1 BE Engineer |
| Request ID middleware | 0.5 day | 1 BE Engineer |
| **Subtotal** | — | **~6.5 days** |

### Performance & Database

| Task | Status | Estimate |
|------|--------|----------|
| Add missing indexes | 0.5 day | DBA |
| Fix N+1 queries | 1 day | BE Engineer |
| Cache feed queries (Redis) | 1.5 days | BE Engineer |
| Query optimization review | 0.5 day | DBA |
| **Subtotal** | — | **~3.5 days** |

### Observability & Monitoring

| Component | Status | Estimate |
|-----------|--------|----------|
| OTLP exporter setup | 0.5 day | DevOps |
| Jaeger tracing (local + staging) | 1 day | DevOps |
| Logging (Pino → Loki) | 1 day | DevOps |
| Prometheus scraping | 0.5 day | DevOps |
| Alert rules (CI pass, latency, errors) | 1 day | DevOps |
| Grafana dashboards (4x) | 1.5 days | DevOps |
| **Subtotal** | — | **~5.5 days** |

### Deployment & Infrastructure

| Task | Status | Estimate |
|------|--------|----------|
| Docker Compose for dev/staging | 1 day | DevOps |
| K8s manifests (deployment, service, ingress) | 1.5 days | DevOps |
| Secrets + ConfigMaps setup | 0.5 day | DevOps |
| Staging cluster provisioning | 1 day | DevOps |
| GitHub Actions deploy workflow | 1 day | DevOps |
| **Subtotal** | — | **~5 days** |

### **Phase 1 Summary**
- **Total Duration:** 2–3 weeks (parallel tracks)
- **Team Size:** 5–6 people (2 FE, 2 BE, 1–2 DevOps)
- **Deliverable:** Beta-ready platform (closed beta signup)
- **Success Metrics:**
  - ✅ 95%+ E2E test pass rate
  - ✅ <500ms P95 latency
  - ✅ Zero downtime deploys
  - ✅ All errors logged + traced

---

## 🟦 PHASE 2: BETA STAGE (3–4 Weeks)

**Goal:** Differentiated user experience + real engagement metrics

### A. Feed Ranking Algorithm (V1)

**Inputs:**
- Recency (posts from last 24h weighted higher)
- Engagement (likes/comments/shares count)
- Relationship strength (direct follow vs network)

**Algorithm:**
```
Score = (0.3 × recency_score)
       + (0.5 × engagement_score)
       + (0.2 × relationship_score)

Sort by Score DESC, then by createdAt DESC
Cache top 500 posts per user for 1 min
```

**Implementation:**
- Precompute top posts of followed users (nightly job)
- Cache in Redis (user:feed:{userId} → sorted set)
- Return top 50 on first load, pagination after

**Estimate:** 3 days (1 BE + 1 DataEng)

### B. Search System

**Option A: PostgreSQL Full-Text Search (MVP)**
```sql
CREATE INDEX idx_post_search ON "Post"
USING GIN (to_tsvector('english', content));

SELECT * FROM "Post"
WHERE to_tsvector('english', content) @@ plainto_tsquery('english', 'keyword')
ORDER BY ts_rank(to_tsvector('english', content),
                 plainto_tsquery('english', 'keyword')) DESC;
```

**Includes:**
- Search posts by text
- Search users by username/bio
- Hashtag aggregation (extract from posts)
- Trending hashtags (24h rolling window)

**Estimate:** 2 days (1 BE)

### C. Notifications System (Event-Driven)

**Architecture:**
- Event types: FOLLOWER_NEW, POST_LIKED, COMMENT_ADDED, MENTION
- Backend emits events to queue (RabbitMQ or Kafka)
- Notification worker consumes + stores + publishes to real-time (Socket.IO)

**Database:**
```prisma
model Notification {
  id String @id @default(cuid())
  userId String
  type String // FOLLOWER_NEW, POST_LIKED, etc.
  actorId String
  contentId String?
  isRead Boolean @default(false)
  createdAt DateTime @default(now())
}
```

**Real-Time:**
- Socket.IO: `notification:new` event
- Stored notifications: `GET /api/notifications` (paginated)
- Mark as read: `POST /api/notifications/:id/read`

**Estimate:** 3 days (1 BE + 1 FE)

### D. Media Layer

**Image Pipeline:**
- Upload to MinIO/S3
- Resize to 3 formats: thumbnail (200x200), medium (600x400), large (1200x800)
- Generate signed URLs (1h expiry)
- Serve via CDN (Cloudflare or BunnyCDN)

**Implementation:**
- Sharp library for resizing
- Background job (Bull queue)
- Return all 3 URLs to frontend

**Estimate:** 2 days (1 BE + 1 DevOps)

### E. Analytics Dashboard

**Tracked Metrics:**
- DAU/WAU/MAU (daily/weekly/monthly active users)
- Retention curves (1d, 7d, 30d)
- Post reach (impressions per post)
- Session length
- Top posts/users

**Dashboard:**
- Grafana with PostgreSQL datasource
- Real-time updates
- Breakdown by device/region

**Estimate:** 2 days (1 DataEng + 1 DevOps)

### **Phase 2 Summary**
- **Total Duration:** 3–4 weeks
- **Team Size:** 4–5 people
- **Deliverable:** Beta platform with ranking, search, notifications
- **Success Metrics:**
  - ✅ Feed relevance score >75%
  - ✅ Search <200ms P95
  - ✅ Notification delivery <2s
  - ✅ Ready for 1,000 beta users

---

## 🟥 PHASE 3: PUBLIC LAUNCH (4–6 Weeks)

**Goal:** Production-grade platform with video, monetization, compliance

### A. Video System

**Pipeline:**
1. Upload to MinIO (temporary)
2. Extract metadata (duration, dimensions)
3. Generate thumbnail
4. Transcode to multiple bitrates (adaptive streaming)
5. Move to CDN
6. Store metadata in Prisma

**Adaptive Bitrates:**
- 360p @ 800kbps
- 720p @ 2.5Mbps
- 1080p @ 5Mbps

**Streaming:** HLS (HTTP Live Streaming)
- FFMPEG for transcoding
- Background job (Celery or Bull)
- HLS.js on frontend

**Estimate:** 4 days (1 BE + 1 DevOps)

### B. Community Features

**Groups:**
- Group model (name, description, privacy)
- Group members + roles (admin, moderator, member)
- Group feed (posts in group)
- Group analytics

**Events:**
- Event model (name, date, location, organizer)
- RSVP system
- Event feed + attendee list

**Local Discovery:**
- Geolocation-based feed (within 5km radius)
- Location-tagged posts
- Local trending

**Estimate:** 4 days (2 BE + 1 FE)

### C. Monetization Layer

**Ad Insertion:**
- Native ad slots (every 5th post in feed)
- CPM-based pricing
- Ad targeting by interests/demographics

**Creator Payouts:**
- Track creator earnings (ad revenue share 70/30)
- Monthly payout (minimum $100)
- Delayed settlement (30-day hold)

**Sponsor System:**
- Creator can create sponsored posts
- Brand pays creator directly
- Marked as "#ad"

**Estimate:** 3 days (1 BE + 1 Finance)

### D. Compliance & Legal

**GDPR:**
- Privacy policy
- Terms of service
- Cookie consent banner
- Data retention policy (logs 90d, data 3yr)

**User Data Export:**
- `GET /api/user/export` → .zip with all user data
- Async job (email download link)
- Includes: posts, comments, follows, messages, metadata

**Content Moderation:**
- User reporting (abuse, spam, harassment)
- Automated ML detection (after Phase 2)
- Manual review queue

**Estimate:** 2 days (1 Legal + 1 BE)

### E. Enterprise Hardening

**Multi-Region Replication:**
- Primary region (US-East)
- Secondary region (EU-West)
- Read replicas in each region
- Async replication lag <5s

**Automated Failover:**
- Health checks every 30s
- Failover script (DNS switch + DB promotion)
- RTO: 2 minutes
- RPO: <5 minutes

**Backup + Restore:**
- Daily backups
- 30-day retention
- Point-in-time recovery available
- Test restore weekly

**Chaos Engineering:**
- Inject failures (network, disk, memory)
- Verify system recovery
- Document MTTR

**Estimate:** 4 days (2 DevOps + 1 SRE)

### **Phase 3 Summary**
- **Total Duration:** 4–6 weeks
- **Team Size:** 6–8 people
- **Deliverable:** Production-grade platform ready for 100K+ users
- **Success Metrics:**
  - ✅ Video streaming P95 <2s
  - ✅ 99.99% uptime SLA
  - ✅ Zero data loss
  - ✅ GDPR compliant

---

## ⚙️ Architecture Evolution

### Current (Identity-Auth Complete)
```
NestJS Monolith (modular structure)
├── Auth Module
├── Social Module
├── Realtime Gateway
└── Tracing (OpenTelemetry)

External:
├── PostgreSQL (HA ready)
├── Redis (single node)
└── MinIO (S3-compatible)
```

### After Phase 1 (MVP Hardening)
```
Same monolith + added:
├── Observability (Jaeger, Loki, Prometheus)
├── Admin module
└── Moderation module

Infrastructure:
├── K8s cluster (2 nodes)
├── Redis (persistent)
└── PostgreSQL (primary + standby)
```

### After Phase 2 (Beta Stage)
```
Introducing workers:
├── Feed ranking service (async job)
├── Notification service (async job)
└── Search indexing (async job)

Message queue:
├── RabbitMQ or Kafka
└── Bull queues for local jobs

Caching:
├── Redis cluster (3 nodes)
└── Cache invalidation strategy
```

### After Phase 3 (Public Launch)
```
Microservices architecture:
├── API Gateway (load balancer)
├── Identity Service (auth)
├── Social Service (posts, follows)
├── Engagement Service (likes, comments)
├── Media Service (images, videos)
├── Feed Ranking Service
├── Notification Service
└── Admin Service

Data layer:
├── PostgreSQL (multi-region replication)
├── Redis Cluster (3 nodes per region)
├── Elasticsearch (search)
└── S3 + CloudFront (media CDN)

Messaging:
├── Kafka (event streaming)
└── Service-to-service RPC

Observability:
├── Grafana (dashboards)
├── Loki (logs)
├── Prometheus (metrics)
├── Jaeger (traces)
└── AlertManager (on-call)
```

---

## 📈 Scaling Strategy

### 100 → 1,000 Users
**Load:** ~100 daily active users, 1 req/sec average

**Infrastructure:**
- Single K8s node (4 CPU, 16GB RAM)
- PostgreSQL (single instance, 100GB storage)
- Redis (single instance, 10GB)
- CDN: Cloudflare (free tier)

**Bottleneck:** PostgreSQL CPU (scale later)

---

### 1,000 → 10,000 Users
**Load:** ~1,000 daily active users, 10 req/sec average

**Changes:**
- Add PostgreSQL read replicas (2 nodes)
- Implement query caching (Redis)
- Background worker for feed ranking
- Introduce RabbitMQ for async jobs

**Database:**
- Indexes optimized (explain analyze all queries)
- Connection pooling (PgBouncer)
- Cache hot queries (user feeds, trending)

**Caching Strategy:**
- Feed cache: 1 min (user:feed:{userId})
- User profiles: 5 min
- Trending posts: 30 min
- Post details: 10 min (invalidate on like/comment)

---

### 10,000 → 100,000 Users
**Load:** ~10,000 daily active users, 100 req/sec average

**Changes:**
- Introduce video streaming (HLS)
- Shard Redis (consistent hashing)
- Replicate PostgreSQL (multi-region)
- Add queue system (Kafka or RabbitMQ)

**Sharding Strategy:**
```
Redis shard by userId:
├── Shard 0 (user IDs 0–250K)
├── Shard 1 (user IDs 250K–500K)
├── Shard 2 (user IDs 500K–750K)
└── Shard 3 (user IDs 750K–1M)

Use consistent hashing for rebalancing
```

**PostgreSQL:**
```
Primary (US-East)
├── Async replica (EU-West)
└── Async replica (Asia-Pacific)

Read queries route to nearest replica
Write queries route to primary
```

**Monitoring:**
- Latency dashboard (P50, P95, P99)
- Error rates by endpoint
- Database slowlog alerting
- Cache hit rate tracking

---

### 100,000 → 1,000,000 Users
**Load:** ~100,000 daily active users, 1,000 req/sec average

**Changes:**
- Multi-region API deployment
- Global CDN (Cloudflare + BunnyCDN)
- ML-powered feed ranking
- Dedicated recommendation service

**Feed Ranking Evolution:**
```
V1: Weighted sum (current)
V2: ML model (engagement prediction)
   Input: user history, post metadata, social graph
   Output: ranking score
   Model: LightGBM or TensorFlow

Inference:
├── Batch: Nightly update
├── Online: Real-time for new posts
└── A/B test: 10% control vs 90% ML
```

**Global Architecture:**
```
Users in US:
├── Route to US-East API
├── Read from US-East PostgreSQL
├── Cache in US-East Redis
└── Serve media from US CDN

Users in EU:
├── Route to EU-West API
├── Read from EU-West PostgreSQL
├── Cache in EU-West Redis
└── Serve media from EU CDN

Cross-region:
├── Postgres logical replication (100ms lag)
├── Redis eventual consistency
└── Conflict resolution (last-write-wins)
```

---

## 📊 KPIs by Phase

| Metric | Phase 1 | Phase 2 | Phase 3 |
|--------|---------|---------|---------|
| **Latency P95** | <500ms | <300ms | <200ms |
| **Uptime SLA** | 99.5% | 99.9% | 99.99% |
| **Error Rate** | <0.5% | <0.1% | <0.01% |
| **Concurrent Users** | 100 | 1,000 | 10,000+ |
| **DAU** | 50 | 500 | 5,000+ |
| **Feature Completeness** | 60% | 85% | 100% |
| **Test Coverage** | 70% | 85% | 95%+ |

---

## 📅 Timeline Summary

```
Nov 20 (Today)          → Identity-Auth Phase Complete
Nov 20–Nov 30           → Immediate Next (Frontend Core + API Hardening)
Dec 1–Dec 15            → Phase 1 (MVP Hardening)
Dec 16–Jan 5            → Phase 2 (Beta Stage)
Jan 6–Feb 15            → Phase 3 (Public Launch)
Feb 16–Mar 15           → Scaling + Optimization

Target: Public launch March 2026
Target: 100K users by June 2026
```

---

## ✅ Next Immediate Actions

1. **Frontend Core** (3–4 days) — Auth + Feed UI
2. **API Hardening** (2–3 days) — Indexes, validation, rate limits
3. **Moderation Foundation** (1–2 days) — Keyword blocklist
4. **Production Pipeline** (2–3 days) — Staging + CI/CD

**Total:** 7–10 days to first testable release

**Team:** 5–6 people (2 FE, 2 BE, 1–2 DevOps)

**Ready to start?** 🚀

---

**Document Generated:** Nov 20, 2025 | **Branch:** feat/identity-auth | **Maintained By:** Chief Architect
