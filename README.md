# DAIRA - Social Media Platform

> A modern, production-ready social media platform inspired by TikTok, Threads, and Instagram with a Facebook-style backend.

[![CI](https://github.com/saintxlucid/D-A-I-R-A/workflows/CI/badge.svg)](https://github.com/saintxlucid/D-A-I-R-A/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🚀 Features

- **Modern Frontend**: Next.js 14 with TypeScript, App Router, PWA support
- **GraphQL API**: FastAPI + Strawberry GraphQL for flexible data queries
- **Real-time Features**: Redis for caching, Redpanda (Kafka) for event streaming
- **Media Storage**: MinIO S3-compatible object storage
- **Database**: PostgreSQL with SQLAlchemy ORM and Alembic migrations
- **Monorepo**: pnpm workspaces + Turborepo for efficient development
- **CI/CD**: GitHub Actions for automated testing and builds
- **Design System**: Tailwind CSS + shadcn/ui with custom theme (Nile Blue, Sandstone, Basalt)
- **RTL/LTR Support**: Built-in internationalization support

## 📋 Table of Contents

- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Development](#development)
- [GraphQL Usage](#graphql-usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         DAIRA Platform                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │   Web Frontend   │              │   Mobile App     │         │
│  │   (Next.js PWA)  │◄────────────►│   (Future)       │         │
│  │   Port 3000      │              │                  │         │
│  └────────┬─────────┘              └──────────────────┘         │
│           │                                                       │
│           │ HTTP/GraphQL                                         │
│           │                                                       │
│  ┌────────▼──────────────────────────────────────────────┐      │
│  │              API Layer (FastAPI)                       │      │
│  │              Port 8000                                 │      │
│  ├────────────────────────────────────────────────────────┤      │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │      │
│  │  │   GraphQL   │  │    REST      │  │   Health    │  │      │
│  │  │   /graphql  │  │  Endpoints   │  │  /health    │  │      │
│  │  └─────────────┘  └──────────────┘  └─────────────┘  │      │
│  │                                                         │      │
│  │  ┌──────────────────────────────────────────────────┐ │      │
│  │  │         Business Logic & Resolvers               │ │      │
│  │  │  • User Management  • Feed Algorithm             │ │      │
│  │  │  • Post Creation    • Comment System             │ │      │
│  │  │  • Follow System    • Simple Ranker Stub         │ │      │
│  │  └──────────────────────────────────────────────────┘ │      │
│  └────────┬─────────┬──────────┬──────────┬─────────────┘      │
│           │         │          │          │                      │
│  ┌────────▼─────┐ ┌─▼──────┐ ┌─▼──────┐ ┌─▼──────────┐         │
│  │  PostgreSQL  │ │ Redis  │ │ MinIO  │ │ Redpanda   │         │
│  │  (Database)  │ │(Cache) │ │ (S3)   │ │ (Kafka)    │         │
│  │  Port 5432   │ │ 6379   │ │ 9000   │ │ 9092       │         │
│  └──────────────┘ └────────┘ └────────┘ └────────────┘         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

Data Models:
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
│  User   │────►│  Post    │◄────│ Comment │     │  Follow  │
│         │     │          │     │         │     │          │
│ id      │     │ id       │     │ id      │     │ follower │
│ handle  │     │ author_id│     │ post_id │     │ following│
│ name    │     │ type     │     │ author  │     └──────────┘
│ bio     │     │ caption  │     │ content │
│ avatar  │     │ media[]  │     └─────────┘
└─────────┘     └──────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- pnpm 8+
- Docker & Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/saintxlucid/D-A-I-R-A.git
   cd D-A-I-R-A
   ```

2. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Start with Docker Compose** (Recommended)
   ```bash
   docker compose up --build
   ```
   
   This will start:
   - Web app at http://localhost:3000
   - API at http://localhost:8000
   - GraphQL Playground at http://localhost:8000/graphql
   - PostgreSQL, Redis, MinIO, and Redpanda

4. **Access the application**
   - Web: http://localhost:3000
   - API Health: http://localhost:8000/health
   - GraphQL: http://localhost:8000/graphql
   - MinIO Console: http://localhost:9001 (minioadmin/minioadmin)

## 💻 Development

### Local Development (without Docker)

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Start infrastructure services**
   ```bash
   docker compose up postgres redis minio redpanda -d
   ```

3. **Setup API**
   ```bash
   cd apps/api
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python scripts/seed.py
   uvicorn app.main:app --reload --port 8000
   ```

4. **Start Web (in another terminal)**
   ```bash
   cd apps/web
   pnpm dev
   ```

### Available Scripts

```bash
pnpm dev         # Start all apps in development mode
pnpm build       # Build all apps
pnpm lint        # Lint all apps
pnpm test        # Run tests
pnpm typecheck   # Type check TypeScript
pnpm format      # Format code with Prettier
```

## 🔌 GraphQL Usage

### Example Queries

**Get Posts**
```graphql
query GetPosts {
  posts(limit: 10) {
    id
    caption
    type
    visibility
    createdAt
    authorId
  }
}
```

**Get User**
```graphql
query GetUser {
  user(handle: "@demo_user") {
    id
    handle
    name
    bio
    followersCount
    followingCount
  }
}
```

### Example Mutations

**Create User**
```graphql
mutation CreateUser {
  createUser(
    handle: "@johndoe"
    name: "John Doe"
    bio: "Hello, DAIRA!"
  ) {
    id
    handle
    name
    createdAt
  }
}
```

**Create Post**
```graphql
mutation CreatePost {
  createPost(
    authorId: 1
    type: TEXT
    caption: "My first post on DAIRA! 🚀"
    visibility: PUBLIC
  ) {
    id
    caption
    type
    createdAt
  }
}
```

### cURL Examples

```bash
# Health check
curl http://localhost:8000/health

# GraphQL query
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ posts(limit: 5) { id caption } }"}'

# Create user
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createUser(handle: \"@newuser\", name: \"New User\") { id handle } }"
  }'
```

## 📁 Project Structure

```
D-A-I-R-A/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   │   ├── page.tsx           # Feed
│   │   │   │   ├── compose/           # Composer
│   │   │   │   ├── profile/[handle]/  # Profile
│   │   │   │   └── rooms/             # Rooms
│   │   │   ├── store/         # Zustand state management
│   │   │   └── lib/           # Utilities
│   │   ├── public/            # Static assets
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── api/                   # FastAPI backend
│       ├── app/
│       │   ├── db/            # Database models
│       │   ├── graphql/       # GraphQL schema & resolvers
│       │   ├── config.py      # Configuration
│       │   ├── database.py    # Database setup
│       │   └── main.py        # FastAPI app
│       ├── alembic/           # Database migrations
│       ├── scripts/           # Utility scripts
│       ├── tests/             # Tests
│       ├── Dockerfile
│       └── requirements.txt
│
├── packages/
│   ├── ui/                    # Shared React components
│   │   └── src/
│   │       ├── components/    # Button, Card, etc.
│   │       └── lib/           # Utilities
│   │
│   └── config/                # Shared configurations
│       ├── eslint-preset.js
│       └── typescript.json
│
├── .github/
│   ├── workflows/             # CI/CD
│   │   ├── ci.yml            # Lint, test
│   │   └── build.yml         # Build Docker images
│   ├── ISSUE_TEMPLATE/
│   ├── pull_request_template.md
│   └── CODEOWNERS
│
├── docker-compose.yml         # Docker services
├── turbo.json                 # Turborepo config
├── pnpm-workspace.yaml        # pnpm workspaces
├── .env.example               # Environment variables template
├── LICENSE                    # MIT License
├── CONTRIBUTING.md            # Contribution guidelines
└── README.md                  # This file
```

## 🎨 Web Application

The web app includes:

### Pages
- **Feed (`/`)**: Vertical feed with posts from followed users
- **Compose (`/compose`)**: Create text, image, video, or voice posts
- **Profile (`/profile/[handle]`)**: User profile with posts and stats
- **Rooms (`/rooms`)**: Discussion rooms and digest view

### Features
- Progressive Web App (PWA) support
- RTL/LTR language support
- Optimistic UI updates
- Time-ago formatting
- Number formatting (1.2K, 1.5M)
- Responsive design
- Dark/Light theme support

## 🐍 API Application

The API provides:

### Entities
- **User**: id, handle, name, bio, avatar
- **Post**: id, author_id, type (video/image/text/voice), caption, media_refs, visibility
- **Follow**: Relationships between users
- **Comment**: Comments on posts

### Features
- GraphQL API with Strawberry
- REST endpoints (`/health`, `/`)
- SQLAlchemy ORM
- Alembic migrations
- Simple in-memory ranker stub
- CORS enabled for localhost

## 🧪 Testing

### Frontend Tests
```bash
cd apps/web
npm test
```

### Backend Tests
```bash
cd apps/api
pytest
pytest --cov=app tests/  # With coverage
```

### CI/CD
- Automated linting on PRs
- Type checking on PRs
- Backend unit tests on PRs
- Docker image builds on main branch

## 🛠 Development Tools

- **Linting**: ESLint (JS/TS), Ruff (Python)
- **Formatting**: Prettier (JS/TS), Black (Python)
- **Type Checking**: TypeScript, Python type hints
- **Pre-commit Hooks**: Husky + lint-staged
- **Commit Linting**: Commitlint (Conventional Commits)

## 📦 Deployment

### Docker Production Build

```bash
# Build images
docker compose -f docker-compose.yml build

# Run in production mode
docker compose up -d
```

### Environment Variables

See `.env.example` for all required environment variables. Key variables:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `MINIO_*`: MinIO/S3 configuration
- `KAFKA_BROKERS`: Redpanda/Kafka brokers
- `SECRET_KEY`: Application secret key (change in production!)
- `JWT_SECRET`: JWT signing secret (change in production!)

⚠️ **Security**: Never commit real secrets to version control!

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Steps
1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- FastAPI and Strawberry GraphQL communities
- shadcn/ui for beautiful components
- All contributors and supporters

## 📞 Support

- 📧 Email: [Create an issue](https://github.com/saintxlucid/D-A-I-R-A/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/saintxlucid/D-A-I-R-A/discussions)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/saintxlucid/D-A-I-R-A/issues)

---

Made with ❤️ by the DAIRA team
