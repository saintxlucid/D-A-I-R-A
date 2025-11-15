# DAIRA Backend Development Guide

## Overview
DAIRA is an Egypt-native social media platform combining features from Instagram, Threads, TikTok, and Facebook, tailored for Egyptian culture and creators. The backend is built for scalability, security, and rapid feature delivery.

---

## Architecture Summary
- **API Gateway:** FastAPI (REST + GraphQL)
- **Database:** PostgreSQL (RLS, partitioning, advanced indexing)
- **Cache:** Redis (sessions, rate limits, feed cache)
- **Object Storage:** MinIO (S3-compatible)
- **Event Streaming:** Kafka/Redpanda
- **Workers:** Celery/Kafka consumers for fanout, analytics, moderation, notifications, ads pacing
- **Search:** OpenSearch (Arabic/Arabizi analyzers)
- **Observability:** Prometheus, OpenTelemetry, Sentry
- **Real-Time:** Socket.IO gateway (WebSocket)

---

## Development Environment Setup
1. **Clone the repository**
   ```sh
git clone <repo-url>
cd D-A-I-R-A
   ```
2. **Install Docker & Docker Compose**
   - [Docker Install Guide](https://docs.docker.com/get-docker/)
3. **Start all services**
   ```sh
make dev
   ```
   - This launches API, DB, Redis, MinIO, Kafka, OpenSearch, Prometheus, Jaeger.
4. **Check service health**
   - API: http://localhost:8000/health
   - GraphQL: http://localhost:8000/graphql
   - WebSocket: ws://localhost:8000/socket.io
   - OpenSearch: http://localhost:9200
   - Prometheus: http://localhost:9090
   - Jaeger: http://localhost:16686

---

## Core Backend Modules
### 1. Authentication & Security
- JWT access/refresh tokens, device fingerprinting
- Rate limiting (Redis-backed)
- RLS middleware for user context
- bcrypt password hashing
- Session management & revocation

### 2. Database Schema
- 40+ tables: User, Post, Comment, Reel, Thread, Hashtag, Reaction, Save, View, Circle, Message, CreatorProfile, Campaign, Report, ModerationEvent, etc.
- Partitioning, advanced indexes, materialized views
- Soft deletes, optimistic locking, audit trail

### 3. GraphQL API
- Type-safe resolvers for all tables
- Field-level permissions, input validation (Pydantic)
- Cursor-based pagination, DataLoader for N+1 prevention
- Real-time notifications via subscriptions

### 4. Worker Services
- Kafka consumers for:
  - Fanout (feed distribution)
  - Counters (engagement aggregation)
  - Analytics (event collection)
  - Notifications (multi-channel delivery)
  - Moderation (content safety)
  - Ads pacing (budget/frequency)
- DLQ, retry logic, Prometheus metrics

### 5. Upload & Media Pipeline
- Presigned URLs, multipart upload
- ffprobe/ffmpeg for metadata, transcoding
- Thumbnail/poster frame generation
- File size/type/quota enforcement

### 6. Caching & Performance
- Redis: sessions, rate limits, feed cache, pub/sub
- App cache: LRU, query result cache
- DB cache: materialized views, query plan caching
- CDN integration for media

### 7. Observability
- Prometheus metrics, OpenTelemetry tracing
- Sentry error tracking
- Health/readiness/liveness checks

### 8. Real-Time Infrastructure
- Socket.IO gateway, Redis adapter
- Live feed updates, notifications, presence, collaborative features

### 9. Search & Discovery
- OpenSearch cluster, custom analyzers
- Real-time indexing via Kafka
- GraphQL search queries, autocomplete

### 10. Moderation & Community
- Admin console for moderation/reporting
- Automated/human-in-the-loop moderation
- Community guidelines, district features

---

## Development Workflow
1. **Branching:** trunk-based, feature branches for major features
2. **Code Reviews:** PRs require 2 approvals
3. **Testing:**
   - Unit: >90% coverage for core modules
   - Integration: API + DB
   - E2E: critical flows
4. **CI/CD:** GitHub Actions for tests, linting, builds
5. **Documentation:** Update docs for every major change

---

## Key Endpoints & Operations
- `/health` - Service health
- `/graphql` - GraphQL playground
- `/socket.io` - WebSocket gateway
- `/upload` - Presigned URL upload
- `/admin` - Moderation console

---

## Best Practices
- Enforce RLS and field-level permissions everywhere
- Use DataLoader for efficient DB access
- Instrument all endpoints with metrics
- Log all moderation/admin actions
- Use environment variables for secrets
- Regularly update dependencies and scan for vulnerabilities

---

## Troubleshooting
- Check logs (JSON format) for errors
- Use Prometheus/Grafana for metrics
- Use Jaeger for tracing
- Health/readiness endpoints for service status

---

## References
- `docs/ARCHITECTURE.md` - Full technical architecture
- `docs/GRAPHQL.md` - API reference
- `docs/REALTIME.md` - WebSocket features
- `docs/SEARCH.md` - OpenSearch integration
- `docs/INNOVATIVE_FEATURES.md` - Unique features
- `EGYPT_VISION.md` - Cultural vision
- `PLATFORM_STRATEGY.md` - Monetization/business model

---

## Contact
- For questions, reach out to the backend lead or open a GitHub issue.
