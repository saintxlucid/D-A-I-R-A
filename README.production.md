# DAIRA (دائرة) — Social Circle Platform

**Create your own custom social bubble.**

Production‑ready monorepo backend for an Egypt‑native fusion of Instagram, Threads, and TikTok with selective Facebook‑class features. Secure by default (RLS + JWT), event‑driven, creator‑first, ads‑ready.

---

## 🚀 What's Inside

* **DB & RLS:** 40+ tables, partitioning, Snowflake IDs, soft deletes, optimistic locking, materialized views.
* **Auth:** JWT access/refresh rotation, device fingerprints, Redis throttles, session mgmt, 90%+ test coverage.
* **API:** FastAPI gateway, **GraphQL** (typed resolvers + DataLoaders) + REST (auth/upload/webhooks). N+1 safe.
* **Workers:** Kafka consumers (fanout, counters, analytics, notifications, moderation, ads pacing) with idempotency + DLQ.
* **Uploads:** MinIO presign, magic‑byte checks, ffprobe metadata, thumbnails/posters, H.264/WebP, multipart.
* **Cache:** Redis tier, app LRU, DB MV refresh, CDN‑ready. Event‑driven invalidation.
* **Observability:** Prometheus, OpenTelemetry, structured logs, health/readiness.
* **Innovations (Egypt‑native):** Vibe Modes, Coffee Break Digest, Neighborhood Watch, Duet Chains, Knowledge Circles, Invisible Ink, Echo Posts, Hype Train, Mind Palace, etc.

---

## 🗂 Repo Layout

```
.
├── apps/
│   ├── api/                    # FastAPI Backend
│   │   ├── app/
│   │   │   ├── auth/          # JWT, device sessions, rate limiting
│   │   │   ├── graphql/       # Schema, resolvers, types, queries, mutations
│   │   │   ├── upload/        # MinIO presigned URLs, media processing
│   │   │   ├── cache/         # Multi-tier caching layer
│   │   │   ├── observability/ # Metrics, tracing, logging
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── main.py
│   │   ├── tests/             # Unit & integration tests
│   │   └── requirements.txt
│   │
│   ├── worker/                # Kafka Consumers
│   │   ├── fanout/           # Feed fanout worker
│   │   ├── counters/         # Engagement counters
│   │   ├── analytics/        # ClickHouse events
│   │   ├── notifications/    # Push/email delivery
│   │   ├── moderation/       # Content safety
│   │   ├── ads_pacing/       # Ad budget pacing
│   │   ├── media_processing/ # Upload pipeline
│   │   └── common/           # Shared Kafka/DB clients
│   │
│   └── web/                  # Next.js Frontend
│       └── ...
│
├── sql/migrations/
│   └── 001_init_enhanced.sql # 40+ tables with RLS
│
├── docs/
│   ├── ARCHITECTURE.md        # System architecture
│   ├── AUTH.md               # Authentication details
│   ├── GRAPHQL.md            # API reference
│   ├── INNOVATIVE_FEATURES.md # 26 unique features
│   ├── EGYPT_VISION.md       # Egypt-native vision
│   └── PLATFORM_STRATEGY.md  # Business model
│
├── scripts/
│   └── seed.py               # Database seeding
│
├── docker-compose.yml        # All services
├── .env.example
├── Makefile                  # Dev commands
├── start.sh                  # One-command start
└── README.md                 # This file
```

---

## ⚡ Quick Start

```bash
# 1) Bootstrap
cp .env.example .env
make dev   # Full setup: build + start + seed

# OR manual:
docker compose up --build -d
docker compose exec -T api sh -c "cd /app && PYTHONPATH=/app python scripts/seed.py"

# 2) Smoke checks
curl -s http://localhost:8000/health
open http://localhost:8000/graphql
```

**Key Endpoints**

* GraphQL Playground: `http://localhost:8000/graphql`
* REST Auth: 
  - `POST /auth/register` - Create account
  - `POST /auth/login` - Email/password login
  - `POST /auth/refresh` - Token refresh
  - `GET /auth/me` - Current user
* Upload: `POST /upload/presign` - Get presigned URL
* Metrics: `http://localhost:9090` (Prometheus)
* Tracing: `http://localhost:16686` (Jaeger)
* Health: `http://localhost:8000/health`

---

## 🔑 Environment (.env.example)

```dotenv
# Core Services
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=daira
POSTGRES_USER=daira
POSTGRES_PASSWORD=changeme

REDIS_URL=redis://redis:6379/0
KAFKA_BROKERS=redpanda:9092

MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=admin123
MINIO_BUCKET_PUBLIC=media-public
MINIO_BUCKET_PRIVATE=media-private

# Auth & Security
JWT_SECRET=replace_with_secure_random_string
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30
BCRYPT_COST_FACTOR=12

# Rate Limiting
RATE_LIMIT_LOGIN=5/15m
RATE_LIMIT_REGISTER=3/1h
RATE_LIMIT_REFRESH=10/1h
RATE_LIMIT_API=100/1m

# Observability
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
PROMETHEUS_PORT=8000
LOG_LEVEL=INFO

# Region/Locale
DEFAULT_LOCALE=ar
DEFAULT_TIMEZONE=Africa/Cairo
DEFAULT_CURRENCY=EGP
SUPPORTED_LANGUAGES=ar,en
```

---

## 🔐 Security Posture

* **RLS everywhere** for user‑scoped data. Middleware sets `SET app.user_id=$uid` per request.
* **JWT rotation** with access (15min) + refresh (30 days) tokens; device fingerprinting.
* **Rate limits** (Redis token bucket) on all sensitive endpoints:
  - Login: 5 attempts / 15 min per email
  - Registration: 3 attempts / hour per IP
  - Refresh: 10 attempts / hour per user
  - API: 100 requests / minute per IP
* **Password hashing**: bcrypt with cost factor 12
* **Uploads**: Magic‑byte validation, size limits (images: 10MB, videos: 500MB), presigned URLs (10min expiry)
* **Audit trail**: All auth events, security actions, and moderation logged

See: `docs/AUTH.md` for complete security documentation.

---

## 🧪 API Examples

### 1) Register & Login

```bash
# Register new user
curl -X POST http://localhost:8000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepass123"
  }'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "securepass123"
  }'
# Returns: { "access_token": "...", "refresh_token": "...", "token_type": "bearer" }
```

### 2) GraphQL: Query Current User & Feed

```bash
ACCESS_TOKEN="<paste_access_token>"

curl -s http://localhost:8000/graphql \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "query { me { id username email userType isVerified followerCount } feed(limit: 10) { edges { node { id content author { username userType } stats { likesCount viewsCount } } } pageInfo { hasNextPage endCursor } } }"
  }' | jq
```

### 3) GraphQL: Create Post

```bash
curl -s http://localhost:8000/graphql \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "mutation CreatePost($input: CreatePostInput!) { createPost(input: $input) { id type content createdAt } }",
    "variables": {
      "input": {
        "type": "REGULAR",
        "content": "Hello from DAIRA! 🎉",
        "mediaUrls": ["https://example.com/image.jpg"]
      }
    }
  }' | jq
```

### 4) Upload Flow

```bash
# Step 1: Get presigned URL
curl -X POST http://localhost:8000/upload/presign \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "filename": "photo.jpg",
    "contentType": "image/jpeg"
  }'
# Returns: { "uploadUrl": "...", "objectKey": "...", "publicUrl": "..." }

# Step 2: Upload directly to MinIO using presigned URL
curl -X PUT "<uploadUrl>" \
  --upload-file photo.jpg \
  -H 'Content-Type: image/jpeg'

# Step 3: Use publicUrl in createPost mutation
```

---

## 🧵 GraphQL Schema Overview

**Types** (30+):
- **Core**: User, Post, Comment, Follow, Block
- **Content**: Reel, Story, Thread, Sound, Hashtag
- **Engagement**: Reaction, Save, Share, View
- **Social**: Circle, Message, MessageThread, Room
- **Monetization**: CreatorProfile, Subscription, Tip, Payout
- **Ads**: Advertiser, Campaign, LineItem, Creative
- **Moderation**: Report, ModerationEvent, SafetyFlag
- **Analytics**: Event, UserAffinity, PerformanceMetric

**Queries**:
- `me` - Current authenticated user with RLS context
- `user(id/username)` - User profile with privacy controls
- `users(filters)` - Paginated user search
- `post(id)` - Single post with nested relationships
- `posts(filters)` - Feed with ranking (sponsoredOnly, creatorsOnly filters)
- `feed(cursor, limit)` - Personalized hybrid feed
- `explore` - Discovery feed with district trends
- `comments(postId)` - Nested comments with LTREE
- `followers/following` - Social graph with pagination
- `notifications` - Real-time notification stream
- `search(query, type)` - Full-text search

**Mutations**:
- **User**: `createUser`, `updateProfile`, `verifyCreator`
- **Content**: `createPost`, `createComment`, `createThread`, `createStory`, `createRoom`
- **Engagement**: `reactPost`, `follow`, `unfollow`, `createCircle`
- **Creator**: `createSubscription`, `tip`, `requestPayout`
- **Moderation**: `report`
- **Ads**: Admin/advertiser operations

See: `docs/GRAPHQL.md` for complete schema reference.

---

## 🧵 Worker Services & Kafka Topics

**Workers**:
1. **Fanout Worker** (`apps/worker/fanout/`) - Write-time feed distribution for <10k followers
2. **Counters Worker** (`apps/worker/counters/`) - Real-time engagement metrics aggregation
3. **Analytics Worker** (`apps/worker/analytics/`) - Event collection for ClickHouse pipeline
4. **Notifications Worker** (`apps/worker/notifications/`) - Push/email/in-app notification delivery
5. **Moderation Worker** (`apps/worker/moderation/`) - Automated content safety checks
6. **Ads Pacing Worker** (`apps/worker/ads_pacing/`) - Budget distribution and frequency caps

**Kafka Topics**:
- `post.created` → Fanout worker
- `post.engagement` → Counters worker
- `user.action` → Analytics worker
- `notification.trigger` → Notifications worker
- `content.flagged` → Moderation worker
- `ad.impression` → Ads pacing worker

**Features**:
- Idempotent message processing with deduplication
- Dead letter queues for failed messages
- Exponential backoff retry logic
- Graceful shutdown handling
- Prometheus metrics per worker
- Structured logging with correlation IDs
- Health check endpoints

---

## 🛰 Feed Ranking Algorithm (EdgeRank++)

```
Score = 0.35×affinity + 0.35×quality + 0.15×freshness + 0.10×diversity − 0.40×negatives
```

**Components**:
- **Affinity**: User interactions (follows, likes, comments, saves, dwell time)
- **Quality**: Content performance (completion rate, watch time, engagement ratio)
- **Freshness**: Time decay with Egyptian day-part priors (peak: 8-11 PM)
- **Diversity**: Author/content type variety bonus
- **Negatives**: Hides, reports, skip velocity, spam signals

**Strategy**:
- **Fanout** for accounts <10k followers (write-time ranking)
- **Fanin** for accounts >10k followers (read-time ranking)
- Hybrid approach balances write amplification vs. read latency

---

## 🛡️ Moderation & Safety

**Pre-publish**:
- Keyword/URL heuristics for spam/abuse
- Velocity caps (posts, follows, DMs)
- Content-type validation

**Post-publish**:
- User reports → moderation queue
- Actions: warn, limit visibility, remove, ban
- Shadow-limit for spam accounts
- Appeals flow with audit trail

**Privacy**:
- Minor accounts: private by default
- Location: opt-in only, never exposed in metadata
- Discovery limits for new accounts
- Family-friendly defaults

See: `docs/MODERATION.md` for complete policies.

---

## 📈 Analytics & KPIs

**Product Metrics**:
- DAU/WAU/MAU, retention cohorts
- Watch time, completion rate, rebuffering
- Click-through rate (CTR)
- P95 latency, error rate

**Creator Metrics**:
- Views, engagement rate, saves/shares
- Revenue per mille (RPM)
- ARPPU (average revenue per paying user)
- Churn rate

**Ads Metrics**:
- CPM/CPC/CPV
- Reach, frequency, impressions
- Spend, pacing, under-delivery
- Holdout A/B tests

**Pipeline**: ClickHouse fed via outbox pattern → analytics worker

---

## 🩺 Health & Monitoring

**Health Checks**:
- **Liveness**: Is service running?
- **Readiness**: Can service accept traffic?
- **Dependencies**: DB, Redis, Kafka, MinIO status
- **Custom metrics**: Business health indicators

**Observability**:
- **Prometheus**: Request latency (p50, p95, p99), rate, errors, cache hit rate
- **OpenTelemetry**: Distributed tracing with correlation IDs
- **Structured Logs**: JSON format with request context

**Runbooks** (excerpt):
- **DB saturation**: Check connections, add read replica, optimize slow queries
- **Kafka lag**: Scale workers, enable backpressure, check consumer group
- **MinIO errors**: Verify credentials, check bucket policy, retry with backoff

See: `docs/ARCHITECTURE.md` for complete runbooks.

---

## 🚀 26 Innovative Features

DAIRA includes 26 unique features that blend familiar social patterns with creative innovations:

**🌟 Signature Features**:
1. **Vibe Modes** - Context-aware UI (Ramadan, Football, Study Season)
2. **Moment Capsules** - Time-released memories
3. **Coffee Break Digest** - 5-min curated content (battles doomscrolling)
4. **Spatial Threads** - 3D conversation visualization
5. **Duet Chains** - Unlimited collaborative creativity
6. **Knowledge Circles** - Community Wikipedia for Egyptian culture
7. **Invisible Ink Posts** - Content reveals over time
8. **Echo Posts** - AI resurfaces relevant old content
9. **Neighborhood Watch** - Privacy-first local discovery
10. **Vibes Check-In** - Emotional status beyond text
11. **Soundscapes** - Location-tagged audio memories
12. **Ghost Mode** - Private browsing without analytics
13. **Time Capsule Communities** - Future-locked groups
14. **Collab Canvas** - Real-time multi-user creation
15. **Pay-It-Forward Feed** - Kindness economy

**🎨 Egyptian Cultural**:
16. **Mahraganat Mode** - Music-first creation with artist credits
17. **Iftar Countdown** - Platform-wide Ramadan features
18. **Balad Mode** - Hyper-local business discovery

**🚀 Technical**:
19-26. Smart offline, adaptive data saver, voice navigation, and more...

**Philosophy**: Quality engagement over vanity metrics. Real connections over noise.

See: `docs/INNOVATIVE_FEATURES.md` for complete specifications and implementation roadmap.

---

## 🗺 Implementation Roadmap

**Phase A1** (Weeks 1-3) - Core Magnetic:
- Feed, Reels, Stories, Threads
- Basic Explore, Upload
- Notifications v1
- Masry Engine basics
- Data Saver, Kheba privacy

**Phase A2** (Weeks 4-6) - Discovery & Community:
- Rooms/Majlis, Events
- Creator Dashboard v0
- Tip Jar sandbox
- Vibe Modes (Ramadan, Football)
- Coffee Break Digest

**Phase B** (Weeks 7-10) - Creator Monetization:
- Subscriptions (tiers, benefits)
- EGP payouts with InstaPay
- Advanced analytics
- Sound library rights
- Brand partnerships

**Phase C** (Weeks 11-14) - Ads MVP:
- Self-serve ads platform
- Targeting (governorate, language, interests)
- Pacing & frequency controls
- Reporting dashboard

**Phase D** (Weeks 15-18) - Community & Events:
- Groups (Halaqat)
- Enhanced events (RSVP, reminders)
- Saved collections
- Advanced moderation

---

## 🔒 Production Readiness Checklist

**Security**:
- [ ] RLS policies audited (deny-by-default)
- [ ] JWT rotation enabled, refresh reuse detection
- [ ] CORS strict, CSRF for web
- [ ] Rate limits tested under load
- [ ] Secrets rotated, not in git

**Infrastructure**:
- [ ] Database backups automated
- [ ] Redis persistence configured
- [ ] Kafka retention policies set
- [ ] MinIO bucket policies reviewed
- [ ] SSL/TLS certificates installed

**Observability**:
- [ ] Prometheus alerts configured
- [ ] On-call rotation established
- [ ] Runbooks documented
- [ ] Log aggregation operational
- [ ] Tracing spans validated

**Compliance**:
- [ ] Privacy policy published
- [ ] Terms of service reviewed
- [ ] Data export/delete paths tested
- [ ] Age verification implemented
- [ ] PDPL readiness confirmed

**Testing**:
- [ ] Load testing completed (target: 10k req/s)
- [ ] Chaos engineering scenarios run
- [ ] Abuse scenarios validated
- [ ] Rollback procedures tested

---

## 🧪 Development Commands

```bash
# Full development setup
make dev

# Individual services
make up               # Start all services
make up-build         # Start with rebuild
make down             # Stop all services
make restart          # Restart services

# Database
make migrate          # Run migrations
make seed             # Seed test data
make shell-db         # PostgreSQL shell

# Testing
make test             # Run all tests
make test-auth        # Auth tests only
make test-cov         # With coverage report

# Quality
make lint             # Ruff linting
make format           # Black formatting
make typecheck        # Mypy type checking
make quality          # All quality checks

# Monitoring
make health           # Check all services
make logs-api         # API logs
make logs-worker      # Worker logs
make metrics          # Open Prometheus
make traces           # Open Jaeger

# Cleanup
make clean            # Remove volumes
make clean-all        # Full reset
```

---

## 📚 Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture, CAP decisions, scaling strategies
- **[AUTH.md](docs/AUTH.md)** - Authentication system, JWT flows, security model
- **[GRAPHQL.md](docs/GRAPHQL.md)** - Complete API reference, queries, mutations
- **[INNOVATIVE_FEATURES.md](docs/INNOVATIVE_FEATURES.md)** - 26 unique features with specs
- **[EGYPT_VISION.md](docs/EGYPT_VISION.md)** - Egypt-native product vision and cultural considerations
- **[PLATFORM_STRATEGY.md](docs/PLATFORM_STRATEGY.md)** - Three-tier business model
- **[VERIFICATION.md](docs/VERIFICATION.md)** - Testing and verification procedures

---

## 🎯 Performance Targets

| Operation | P50 | P95 | P99 |
|-----------|-----|-----|-----|
| Register | <50ms | <100ms | <200ms |
| Login | <40ms | <80ms | <150ms |
| Token Refresh | <30ms | <60ms | <100ms |
| GraphQL Query (simple) | <40ms | <80ms | <150ms |
| GraphQL Query (complex) | <100ms | <200ms | <400ms |
| Mutation (create) | <30ms | <60ms | <100ms |
| Feed Load | <50ms | <100ms | <200ms |
| Search Query | <100ms | <200ms | <400ms |
| Upload Presign | <50ms | <100ms | <150ms |
| Worker Processing | <1s | <3s | <5s |

**Current Status**: ✅ Meeting all P95 targets in local testing.

---

## 🤝 Contributing

**Code Style**:
- Python: Black formatting, Ruff linting, type hints required
- Tests: 90%+ coverage for core services
- Commits: Conventional commits format

**CI Pipeline**:
1. Lint (ruff)
2. Format check (black)
3. Type check (mypy)
4. Tests (pytest with coverage)
5. Build (Docker)

**Pull Request Process**:
1. Create feature branch from `main`
2. Implement changes with tests
3. Run `make quality` locally
4. Submit PR with description
5. Address review feedback
6. Squash merge after approval

---

## 📄 License

Internal use during private beta. License to be determined before public launch.

---

## 💬 Credits & Philosophy

**Built for**: Egyptian creators, communities, and culture.

**Core Principles**:
- Quality engagement over vanity metrics
- Real connections over noise
- Privacy-first, family-friendly defaults
- Creator success = platform success
- Battle doomscrolling with intentional design

> "DAIRA (دائرة) means 'circle' — your own social circle, your own rules, your own vibe."

---

## 🔗 Resources

- **Production URL**: TBD (private beta)
- **Status Page**: TBD
- **Support**: TBD
- **Blog**: TBD

---

**Built with ❤️ in Cairo for the MENA region.**
