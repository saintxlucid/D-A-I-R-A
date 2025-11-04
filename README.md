# DAIRA - Social Media Platform

A production-ready social media platform with TikTok/Threads/Instagram-inspired UX and a Facebook-inspired backend architecture. Built as a modern monorepo with Next.js, FastAPI, and GraphQL.

## 🚀 Features

- **Modern Web App**: Next.js 14 with TypeScript, PWA support, Tailwind CSS
- **RTL/LTR Support**: Full internationalization with Arabic and English support
- **GraphQL API**: FastAPI with Strawberry GraphQL for efficient data fetching
- **Social Features**: Posts, comments, follows, user profiles
- **Real-time**: Ready for WebSocket/Rooms integration
- **Microservices Ready**: PostgreSQL, Redis, MinIO (S3), Redpanda (Kafka)

## 📁 Project Structure

```
D-A-I-R-A/
├── apps/
│   ├── web/                 # Next.js frontend application
│   │   ├── src/
│   │   │   ├── pages/      # Feed, Composer, Profile, Rooms
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── lib/        # Apollo Client, utilities
│   │   │   └── styles/     # Global styles with Tailwind
│   │   └── public/         # Static assets, PWA manifest
│   └── api/                # FastAPI backend
│       ├── app/
│       │   ├── models/     # SQLAlchemy models
│       │   ├── graphql/    # GraphQL schema, queries, mutations
│       │   └── main.py     # FastAPI application
│       └── tests/          # API tests
├── scripts/                # Database seeds and utilities
├── .github/
│   └── workflows/          # CI/CD pipelines
└── docker-compose.yml      # Multi-service orchestration
```

## 🛠 Tech Stack

### Frontend (apps/web)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom theme
- **GraphQL Client**: Apollo Client
- **PWA**: next-pwa for offline support
- **i18n**: Built-in Next.js internationalization (en, ar)

### Backend (apps/api)
- **Framework**: FastAPI (Python 3.11+)
- **GraphQL**: Strawberry GraphQL
- **ORM**: SQLAlchemy with async support
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Storage**: MinIO (S3-compatible)
- **Message Queue**: Redpanda (Kafka-compatible)

## 📦 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

## 🚀 Quick Start

### Option 1: One-Command Start (Recommended)

```bash
# Clone the repository
git clone https://github.com/saintxlucid/D-A-I-R-A.git
cd D-A-I-R-A

# Use the start script (handles everything)
./start.sh
```

### Option 2: Manual Docker Compose (Full Control)

```bash
# Clone the repository
git clone https://github.com/saintxlucid/D-A-I-R-A.git
cd D-A-I-R-A

# Start all services (this will take 10-15 minutes on first run due to npm install)
docker compose up --build

# In another terminal, seed the database
docker compose exec -T api sh -c "cd /app && PYTHONPATH=/app python scripts/seed.py"
```

**Note**: The web app build (npm install) can take 10-15 minutes on first run. For faster development, use Option 3 below.

This will start:
- **Web App**: http://localhost:3000
- **API**: http://localhost:8000
- **GraphQL Playground**: http://localhost:8000/graphql
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Redpanda**: localhost:9092

### Option 3: Development Setup (Fastest - Recommended for Development)

This starts only the backend services (Postgres, Redis, etc.) and runs the API and web app locally for faster iteration.

#### Step 1: Start Backend Services

```bash
# Clone the repository
git clone https://github.com/saintxlucid/D-A-I-R-A.git
cd D-A-I-R-A

# Start backend services only
docker compose -f docker-compose.services.yml up -d
```

#### Step 2: Setup and Run API

```bash
cd apps/api
pip install -r requirements.txt

# Initialize database
export DATABASE_URL="postgresql+asyncpg://daira:daira123@localhost:5432/daira"
python -m app.init_db

# Seed database
cd ../..
python scripts/seed.py

# Start API
cd apps/api
uvicorn app.main:app --reload
```

API will be available at http://localhost:8000

#### Step 3: Setup and Run Web App

```bash
cd apps/web
npm install
npm run dev
```

Web app will be available at http://localhost:3000

### 3. Environment Setup (Optional)

Copy the example environment files if you need custom configuration:

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env
```

## ✅ Verification

After starting the services, verify everything is working:

### Check API Health
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

### Test GraphQL Query
```bash
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { posts { id content author { username displayName } } }"}'
```

### Test GraphQL Mutation
```bash
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { createPost(content: \"Hello from GraphQL!\", authorId: 1) { id content } }"}'
```

### Visit Web App
Open http://localhost:3000 in your browser to see the DAIRA social media interface.

## 📱 Application Screens

### Feed (Home Page)
- View all posts from users you follow
- Switch between Feed and Rooms tabs
- Real-time updates
- Like and comment on posts

### Composer
- Create new posts (up to 500 characters)
- Rich text support
- Image upload ready (MinIO integration)
- Character counter

### Profile
- View user information and bio
- See follower/following counts
- Browse user's posts, replies, media, and likes
- Edit profile functionality

### Rooms → Digest
- Audio/video rooms listing
- Live listener counts
- Join live conversations

## 🔧 Development

### Web Development

```bash
cd apps/web
npm install
npm run dev
```

The app will be available at http://localhost:3000

### API Development

```bash
cd apps/api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -e .
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

### Run Tests

```bash
# Web tests
cd apps/web
npm test

# API tests
cd apps/api
pytest
```

### Lint Code

```bash
# Web
cd apps/web
npm run lint

# API
cd apps/api
ruff check app/
black app/
mypy app/
```

## 🔌 GraphQL API

### Sample Queries

#### Get all posts
```graphql
query {
  posts {
    id
    content
    createdAt
    author {
      id
      username
      displayName
    }
    commentsCount
    likesCount
  }
}
```

#### Get users
```graphql
query {
  users {
    id
    username
    displayName
    bio
  }
}
```

### Sample Mutations

#### Create a user
```graphql
mutation {
  createUser(
    username: "johndoe"
    email: "john@example.com"
    displayName: "John Doe"
    bio: "Software Developer"
  ) {
    id
    username
    displayName
  }
}
```

#### Create a post
```graphql
mutation {
  createPost(
    content: "Hello, DAIRA!"
    authorId: 1
  ) {
    id
    content
    createdAt
  }
}
```

## 🐳 Docker Services

- **postgres**: PostgreSQL 16 database
- **redis**: Redis 7 for caching and sessions
- **minio**: S3-compatible object storage for media
- **redpanda**: Kafka-compatible event streaming
- **api**: FastAPI GraphQL backend
- **web**: Next.js frontend application

## 🔐 Environment Variables

### API (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `MINIO_ENDPOINT`: MinIO server endpoint
- `MINIO_ACCESS_KEY`: MinIO access key
- `MINIO_SECRET_KEY`: MinIO secret key
- `KAFKA_BOOTSTRAP_SERVERS`: Redpanda/Kafka servers

### Web (apps/web/.env)
- `NEXT_PUBLIC_API_URL`: GraphQL API endpoint

## 🧪 Testing

The project includes:
- Unit tests for API endpoints
- GraphQL query/mutation tests
- React component tests
- Integration tests

Run all tests with:
```bash
npm test
```

## 📈 CI/CD

GitHub Actions workflow includes:
- Linting (ESLint, Ruff, Black)
- Type checking (TypeScript, MyPy)
- Unit tests
- Docker image builds
- Code coverage reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- FastAPI for the modern Python web framework
- Strawberry for GraphQL in Python
- The open-source community
