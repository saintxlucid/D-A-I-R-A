# DAIRA Quickstart Guide

## Prerequisites

- Node.js 18+ and pnpm 8+
- Python 3.11+ 
- Docker and Docker Compose

## Quick Start Options

### Option 1: Full Stack with Docker (Recommended)

Start all services with one command:

```bash
docker compose up --build
```

This starts:
- Web app: http://localhost:3000
- API: http://localhost:8000
- GraphQL: http://localhost:8000/graphql
- PostgreSQL, Redis, MinIO, Redpanda

Demo data is automatically seeded.

### Option 2: Local Development

1. **Start infrastructure services:**
```bash
docker compose up postgres redis minio redpanda -d
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Start API (Terminal 1):**
```bash
cd apps/api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python scripts/seed.py
uvicorn app.main:app --reload --port 8000
```

4. **Start Web (Terminal 2):**
```bash
pnpm dev
```

Or use the monorepo command:
```bash
pnpm dev  # Starts both web and API
```

## Verify Installation

1. **Web App:** Open http://localhost:3000
   - You should see the feed with demo posts
   - Navigate to /compose, /profile/@demo_user, /rooms

2. **API:** Check http://localhost:8000/health
   - Should return `{"status": "healthy"}`

3. **GraphQL:** Open http://localhost:8000/graphql
   - Try the example queries from README.md

## Development Commands

```bash
# Run all linters
pnpm lint

# Type check all packages
pnpm typecheck

# Build all packages
pnpm build

# Run tests
pnpm test

# Format code
pnpm format
```

## Common Issues

**Port already in use:**
- Stop conflicting services or change ports in .env

**Database connection error:**
- Ensure PostgreSQL is running: `docker compose up postgres -d`
- Check DATABASE_URL in .env

**pnpm not found:**
```bash
npm install -g pnpm@8.15.0
```

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Explore the [GraphQL schema](apps/api/app/graphql/schema.py)
- Customize the theme in [tailwind.config.js](apps/web/tailwind.config.js)
