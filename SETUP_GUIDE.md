# DAIRA Setup and Testing Guide

## Quick Verification Steps

### 1. Start Backend Services Only (Fast - Recommended First)

```bash
# Start Postgres, Redis, MinIO, Redpanda
docker compose -f docker-compose.services.yml up -d

# Wait for services to be healthy (15-20 seconds)
docker ps

# Install API dependencies
cd apps/api
pip install -r requirements.txt

# Initialize database
export DATABASE_URL="postgresql+asyncpg://daira:daira123@localhost:5432/daira"
python -m app.init_db

# Seed database
cd ../..
export PYTHONPATH=$PWD/apps/api:$PYTHONPATH
python scripts/seed.py

# Start API
cd apps/api
uvicorn app.main:app --reload
```

### 2. Test API

```bash
# Check health
curl http://localhost:8000/health

# Test GraphQL query
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { posts { id content author { username displayName } } }"}'

# Test GraphQL mutation
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { createPost(content: \"Test post!\", authorId: 1) { id content } }"}'
```

### 3. Start Web App

```bash
cd apps/web
npm install
npm run dev
```

Visit http://localhost:3000 to see the app.

### 4. Full Docker Compose (Takes 10-15 minutes on first build)

```bash
# Stop any running services
docker compose -f docker-compose.services.yml down

# Build and start everything
docker compose up --build

# In another terminal, seed the database
docker compose exec api python scripts/seed.py
```

Visit:
- Web: http://localhost:3000
- API: http://localhost:8000
- GraphQL: http://localhost:8000/graphql
- MinIO Console: http://localhost:9001 (minioadmin/minioadmin)

## What's Been Implemented

### ✅ Backend API (FastAPI + Strawberry GraphQL)
- **Models**: User, Post, Comment, Follow relationship
- **GraphQL Queries**:
  - `posts` - Get all posts with author and comments count
  - `post(id)` - Get single post
  - `users` - Get all users
- **GraphQL Mutations**:
  - `createUser` - Create a new user
  - `createPost` - Create a new post
  - `createComment` - Create a comment on a post
- **Database**: PostgreSQL with SQLAlchemy async
- **Services**: Redis, MinIO (S3), Redpanda (Kafka) configured
- **Seed Data**: 3 users, 5 posts, 3 comments

### ✅ Frontend Web App (Next.js + TypeScript)
- **Screens**:
  - **Feed** (`/`) - View all posts, switch between Feed and Rooms tabs
  - **Composer** (`/composer`) - Create new posts with character counter
  - **Profile** (`/profile`) - User profile with tabs (Posts, Replies, Media, Likes)
  - **Rooms → Digest** - Tab in Feed showing live audio rooms
- **Features**:
  - PWA support with manifest.json
  - Tailwind CSS for styling
  - RTL/LTR support (English and Arabic)
  - Apollo Client for GraphQL
  - Responsive design

### ✅ Infrastructure
- **Docker Compose**: Multi-service orchestration
  - PostgreSQL 16
  - Redis 7
  - MinIO (S3-compatible storage)
  - Redpanda (Kafka-compatible messaging)
- **CI/CD**: GitHub Actions workflow for lint, test, build
- **Documentation**: Comprehensive README with setup instructions

### ✅ Development Setup
- **Monorepo**: Turborepo for workspace management
- **Linting**: ESLint (web), Ruff/Black (API)
- **Type Safety**: TypeScript (web), MyPy (API)
- **Testing**: Jest setup (web), Pytest (API)

## Architecture Highlights

### Backend
- Async PostgreSQL with SQLAlchemy
- Strawberry GraphQL for type-safe API
- FastAPI for high performance
- Pydantic for data validation
- Ready for Redis caching, MinIO file storage, Redpanda events

### Frontend
- Next.js 14 with App Router capabilities (Pages Router used for simplicity)
- Apollo Client for efficient GraphQL queries
- Progressive Web App (PWA) capabilities
- Internationalization (i18n) with RTL support
- TikTok/Threads/Instagram-inspired UX

## Known Items for Production

1. **Authentication**: Add JWT auth system (scaffold in place)
2. **File Uploads**: Connect MinIO for media uploads
3. **Real-time**: Add WebSocket subscriptions for live updates
4. **Event Streaming**: Connect Redpanda for activity feeds
5. **Likes**: Implement like functionality (counter placeholder added)
6. **Following**: Use follow relationships for personalized feeds
7. **Tests**: Add comprehensive test coverage
8. **Icons**: Replace placeholder PWA icons with designed assets

## Troubleshooting

### Docker build takes too long
- Use `docker-compose.services.yml` for development
- Run API and Web locally for faster iteration

### SSL certificate errors during build
- Fixed by adding `--trusted-host` flags in Dockerfile
- Uses `requirements.txt` instead of `pyproject.toml` for pip install

### GraphQL not returning data
- Ensure database is initialized: `python -m app.init_db`
- Ensure database is seeded: `python scripts/seed.py`
- Check API is running: `curl http://localhost:8000/health`

### Web app not connecting to API
- Check `NEXT_PUBLIC_API_URL` in `.env`
- Default: `http://localhost:8000/graphql`
- Ensure API is running and accessible
