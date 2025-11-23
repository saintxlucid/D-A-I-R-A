# D-A-I-R-A Backend API

Production-ready NestJS microservices backend for the D-A-I-R-A social video platform.

## Architecture Overview

### Microservices (9 modules)

1. **Auth Service** - JWT, OTP (WhatsApp), Flash Call, Biometric authentication
2. **User Service** - Profile management, Circles, Trust scoring, Verification badges
3. **Feed Service** - Multi-layer feeds (Stories → Circles → Outer → Trending), Cursor pagination
4. **Media Service** - Video upload (Tus.io), FFmpeg transcoding (3 quality tiers), HLS streaming
5. **Interaction Service** - Likes, Comments, Duets, Stitches, DM notifications
6. **Wallet Service** - Virtual currency, Tipping, Subscriptions, Cashout (Fawry, Vodafone Cash)
7. **Recommendation Service** - Vector search (Qdrant), Cold-start, Trending algorithm
8. **Realtime Service** - Socket.IO: chat rooms, typing indicators, presence, live streams
9. **Moderation Service** - NSFW detection, Content reports, Admin dashboard, PDPL logging

### Technology Stack

**Core:**
- NestJS 10 + TypeScript 5.5
- Apollo GraphQL Federation
- REST API fallback

**Databases:**
- **PostgreSQL 16** - Users, auth, transactions
- **ScyllaDB** - High-velocity: likes, comments, follows
- **Qdrant** - Vector embeddings for recommendations
- **Redis** - Caching, job queues, real-time

**Infrastructure:**
- BullMQ + Redis - Async job processing
- Socket.IO - Real-time communication
- FFmpeg - Video transcoding
- Docker + Kubernetes - Deployment
- Cloudflare R2 - Media storage

## Setup & Installation

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7+

### Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/daira
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=daira

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis

# Authentication
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=7d

# External Services
QDRANT_URL=http://localhost:6333
SCYLLA_HOSTS=localhost:9042

# Storage
CLOUDFLARE_R2_ENDPOINT=https://your-bucket.r2.cloudflarestorage.com
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# API
FRONTEND_URL=http://localhost:3000
PORT=3000
NODE_ENV=development
```

### Installation

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Docker Setup

### Quick Start with Docker Compose

```bash
# Start all services
docker-compose -f docker-compose.backend.yml up -d

# View logs
docker-compose -f docker-compose.backend.yml logs -f backend

# Stop services
docker-compose -f docker-compose.backend.yml down
```

Services started:
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Qdrant: localhost:6333
- ScyllaDB: localhost:9042
- Backend API: localhost:3000

### Production Build

```bash
# Build Docker image
docker build -f Dockerfile.prod -t daira/backend:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  daira/backend:latest
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- Docker image pushed to registry

### Deploy to K8s

```bash
# Create namespace
kubectl create namespace daira

# Create secrets
kubectl apply -f k8s/config.yaml -n daira

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml -n daira

# Check deployment
kubectl get pods -n daira
kubectl logs -f deployment/daira-backend -n daira

# Expose service (if needed)
kubectl port-forward svc/daira-backend 3000:80 -n daira
```

## API Endpoints

### GraphQL

- **Endpoint:** `POST /graphql`
- **Schema:** `GET /graphql/schema`
- **Playground:** `GET /graphql` (dev only)

Example query:
```graphql
query {
  me {
    id
    email
    profile {
      displayName
      avatar
    }
  }
}
```

### REST Endpoints

**Auth:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with email/password
- `POST /auth/verify-otp` - Verify WhatsApp OTP
- `POST /auth/flash-call` - Verify with Flash Call

**Users:**
- `GET /users/:userId/profile` - Get user profile
- `POST /users/:userId/circles` - Create circle
- `GET /users/:userId/circles` - List circles
- `GET /users/:userId/trust-score` - Get trust score

**Feeds:**
- `GET /feeds/home?cursor=...` - Home feed
- `GET /feeds/circle/:circleId` - Circle feed
- `GET /feeds/trending` - Trending videos

**Media:**
- `POST /media/upload` - Upload video (resumable)
- `GET /media/:videoId/status` - Get transcoding status

**Interactions:**
- `POST /interactions/reactions` - Like/react to post
- `POST /interactions/comments` - Comment on post
- `POST /interactions/messages` - Send direct message

**Wallet:**
- `GET /wallets/:userId` - Get wallet balance
- `POST /wallets/tips` - Send tip
- `POST /wallets/:userId/transactions` - Create transaction

**Recommendations:**
- `GET /recommendations/users/:userId/recommended` - Personalized feed
- `GET /recommendations/trending` - Trending videos

**Moderation:**
- `POST /moderation/check-content` - Check content
- `POST /moderation/report` - Report content
- `GET /moderation/queue` - Admin queue

**Health:**
- `GET /health` - Basic health check
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe

## Database Schema

30+ models covering:

- **Auth:** User, Profile, Session, AuditLog, VerificationBadge
- **Social:** Circle, CircleMember, Follow
- **Content:** Post, Video, Story, PostAttachment
- **Interactions:** Reaction, Comment, Message
- **Wallet:** Wallet, PaymentMethod, Transaction, Tip, CreatorSubscription, CreatorMetrics
- **Moderation:** ContentModeration, ContentReport

See `prisma/schema.prisma` for full schema.

## Development

### Project Structure

```
packages/backend/
├── src/
│   ├── modules/
│   │   ├── auth/                 # Authentication
│   │   ├── user/                 # User management
│   │   ├── feed/                 # Feed generation
│   │   ├── media/                # Video handling
│   │   ├── interaction/          # Likes, comments
│   │   ├── wallet/               # Payments
│   │   ├── recommendation/       # Recommendations
│   │   ├── realtime/             # Socket.IO
│   │   └── moderation/           # Content moderation
│   ├── lib/
│   │   ├── guards/               # Auth guards
│   │   ├── middleware/           # HTTP middleware
│   │   ├── workers/              # BullMQ processors
│   │   ├── prisma.service.ts     # Prisma client
│   │   └── health.controller.ts  # Health checks
│   ├── config/
│   │   └── configuration.ts      # Environment config
│   └── main.ts                   # Entry point
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration files
├── test/                         # Unit tests
├── docker-compose.backend.yml    # Local dev stack
└── Dockerfile.prod               # Production image
```

### Running Tests

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:e2e

# Coverage
pnpm test:cov
```

### Code Quality

```bash
# Linting
pnpm lint

# Type checking
pnpm tsc

# Format code
pnpm format
```

## Performance & Optimization

### Caching Strategy

- GraphQL field-level caching (Redis)
- Feed caching (30s TTL)
- User profile caching (5m TTL)
- Trending algorithm (hourly refresh)

### Database Optimization

- Cursor-based pagination (no offset)
- Database indexes on frequently queried fields
- Connection pooling (PgBouncer)
- Materialized views for complex queries

### Video Processing

- Tus.io resumable upload (handle interruptions)
- FFmpeg 3-tier transcoding:
  - 240p (low bandwidth, mobile)
  - 480p (standard, most users)
  - 720p (high quality, desktop)
- HLS adaptive streaming
- CDN integration (Cloudflare)

## Monitoring & Observability

### Health Checks

```bash
# Liveness (is app running?)
curl http://localhost:3000/health/live

# Readiness (is app ready to accept traffic?)
curl http://localhost:3000/health/ready
```

### Logging

Structured logging with Winston:
- HTTP request/response logs
- Database query logs
- Error stack traces
- Business event logs

### Metrics (Prometheus)

- Request count/latency by endpoint
- Database connection pool status
- Job queue depth
- Cache hit/miss rate

### Tracing (Jaeger)

- Distributed tracing across services
- Video transcoding pipeline trace
- API request trace

## Production Deployment

### Pre-deployment Checklist

- [ ] Environment variables set correctly
- [ ] Database migrations run: `pnpm prisma migrate deploy`
- [ ] JWT secret changed from default
- [ ] CORS origin restricted
- [ ] Rate limiting enabled
- [ ] Database backups configured
- [ ] Monitoring/alerting configured
- [ ] SSL/TLS certificate installed

### Deployment Steps

```bash
# Build and tag image
docker build -f Dockerfile.prod -t daira/backend:v1.0.0 .
docker push daira/backend:v1.0.0

# Update K8s deployment
kubectl set image deployment/daira-backend \
  backend=daira/backend:v1.0.0 -n daira

# Monitor rollout
kubectl rollout status deployment/daira-backend -n daira

# Rollback if needed
kubectl rollout undo deployment/daira-backend -n daira
```

### Scaling

**Horizontal Scaling:**
- K8s HPA automatically scales 2-10 replicas based on CPU/memory
- Load balancer distributes traffic
- Sticky sessions for Socket.IO (using Redis adapter)

**Vertical Scaling:**
- Adjust resource requests/limits in deployment
- Database: increase connections, cache size
- Redis: increase memory allocation

## Troubleshooting

### Service won't start

```bash
# Check logs
docker-compose -f docker-compose.backend.yml logs backend

# Check environment variables
env | grep DATABASE

# Test database connection
psql $DATABASE_URL -c "SELECT 1"
```

### High memory usage

```bash
# Check Node.js process
ps aux | grep node

# Enable memory profiling
NODE_OPTIONS=--max-old-space-size=2048 pnpm start

# Check for memory leaks (in test)
pnpm test:leak-detection
```

### Database query slow

```bash
# Enable query logging
QUERY_LOG=1 pnpm dev

# Check indexes
psql $DATABASE_URL -c "\d+ table_name"

# Analyze query plan
EXPLAIN ANALYZE SELECT ...
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT - See LICENSE file
