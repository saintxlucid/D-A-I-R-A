# DAIRA (دائرة)

**Share your world. Expand your circle.**

DAIRA is an Egypt-born, global social app that combines TikTok/Threads/Instagram UX with a Facebook-inspired backend. Built as a production-ready monorepo with modern web technologies.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/saintxlucid/D-A-I-R-A.git
cd D-A-I-R-A

# Copy environment file
cp infra/.env.example infra/.env

# Start all services with Docker Compose
docker compose -f infra/docker-compose.yml up --build
```

The application will be available at:
- **Web App**: http://localhost:3000
- **API**: http://localhost:8000
- **GraphQL Playground**: http://localhost:8000/graphql
- **MinIO Console**: http://localhost:9001

## 📦 Project Structure

```
D-A-I-R-A/
├── apps/
│   ├── web/          # Next.js 14+ frontend (TypeScript, App Router, PWA)
│   └── api/          # FastAPI + Strawberry GraphQL backend
├── packages/
│   ├── ui/           # Shared React components
│   └── config/       # Shared ESLint/TypeScript configs
├── infra/            # Docker Compose, Dockerfiles, environment configs
├── docs/             # Documentation
└── .github/          # CI/CD workflows, templates
```

## 🛠 Tech Stack

### Frontend (apps/web)
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + brand theme
- **State Management**: Zustand + React Query
- **Components**: Custom UI library + shadcn/ui patterns
- **i18n**: English/Arabic with RTL support

### Backend (apps/api)
- **Framework**: FastAPI
- **GraphQL**: Strawberry GraphQL
- **Database**: PostgreSQL + SQLAlchemy + Alembic
- **Caching**: Redis
- **Storage**: MinIO (S3-compatible)
- **Events**: Redpanda (Kafka-compatible)

### Monorepo
- **Package Manager**: pnpm workspaces
- **Task Runner**: Turborepo
- **Linting**: ESLint, Prettier, Black, Ruff

## 🎨 Brand

- **Name**: DAIRA (دائرة) - Arabic for "circle"
- **Tagline**: Share your world. Expand your circle.
- **Colors**:
  - Nile Blue: `#0D2C56`
  - Sandstone: `#D9C8A0`
  - Basalt: `#2C2C2C`
  - Electric Mint: `#2CF5C4`
  - Off-white: `#FAFAF8`
- **Fonts**: Inter (English), Cairo (Arabic)

## 🌟 Key Features

### Feed (Reels-First)
- Vertical video feed with TikTok-style UX
- Actions: Like, Comment, Boost, Save, Share
- Infinite scroll with cursor-based pagination

### Composer (Threads-Style)
- Text posts (≤500 chars)
- Image/video/voice attachments
- Poll support
- Real-time character counter

### Profile
- Grid + Reels + Threads tabs
- Follow/Unfollow
- Highlights and pinned content

### Rooms (Time-Boxed Discussions)
- Voice + Text + Evidence lanes
- AI-generated digests after closure
- Structured conversation format

## 📋 Available Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # Run all apps in dev mode
cd apps/web && pnpm dev     # Run web only
cd apps/api && uvicorn app.main:app --reload  # Run API only

# Build
pnpm build            # Build all apps

# Lint & Format
pnpm lint             # Lint all code
pnpm format           # Format all code

# Test
pnpm test             # Run all tests
cd apps/api && pytest # Run API tests

# Docker
docker compose -f infra/docker-compose.yml up --build    # Start all
docker compose -f infra/docker-compose.yml down          # Stop all

# Database
cd apps/api
alembic upgrade head  # Run migrations
python scripts/seed.py # Seed demo data
```

## 🧪 Testing

### API Tests
```bash
cd apps/api
pytest
```

### Web Tests
```bash
cd apps/web
pnpm test
```

## 📚 Documentation

- [BRAND.md](docs/BRAND.md) - Brand guidelines, colors, typography
- [UX.md](docs/UX.md) - User flows and interaction patterns
- [MODERATION.md](docs/MODERATION.md) - Content moderation policies
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture diagrams
- [CONTRIBUTING.md](docs/CONTRIBUTING.md) - Contribution guidelines
- [CODE_OF_CONDUCT.md](docs/CODE_OF_CONDUCT.md) - Community standards

## 🔐 Environment Variables

See `infra/.env.example` for all configuration options. Key variables:

- `POSTGRES_*`: Database connection
- `REDIS_HOST`: Redis connection
- `MINIO_*`: Object storage
- `KAFKA_BROKERS`: Event streaming
- `JWT_SECRET`: Authentication secret
- `NEXT_PUBLIC_API_URL`: API endpoint for web app

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) first.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🌍 Community

- Follow [@daira](https://twitter.com/daira) on Twitter
- Join our [Discord](https://discord.gg/daira)
- Report bugs via [GitHub Issues](https://github.com/saintxlucid/D-A-I-R-A/issues)

---

Built with ❤️ in Egypt 🇪🇬
