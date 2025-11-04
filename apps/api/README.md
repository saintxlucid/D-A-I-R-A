# DAIRA API

FastAPI + Strawberry GraphQL backend for DAIRA social media platform.

## Features

- FastAPI web framework
- Strawberry GraphQL for API
- SQLAlchemy ORM with PostgreSQL
- Alembic for database migrations
- Redis for caching
- MinIO for media storage
- Redpanda (Kafka-compatible) for event streaming

## Quick Start

### With Docker

```bash
docker compose up --build
```

### Local Development

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

3. Run migrations:
```bash
alembic upgrade head
```

4. Seed demo data:
```bash
python scripts/seed.py
```

5. Start the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /` - API info
- `GET /health` - Health check
- `POST /graphql` - GraphQL endpoint

## GraphQL Examples

### Create User

```graphql
mutation {
  createUser(handle: "@johndoe", name: "John Doe", bio: "Hello world") {
    id
    handle
    name
    bio
  }
}
```

### Create Post

```graphql
mutation {
  createPost(
    authorId: 1
    type: TEXT
    caption: "My first post!"
    visibility: PUBLIC
  ) {
    id
    caption
    createdAt
  }
}
```

### Get Posts

```graphql
query {
  posts(limit: 10) {
    id
    caption
    type
    createdAt
  }
}
```

## Testing

```bash
pytest
pytest --cov=app tests/
```

## Linting

```bash
ruff check .
black .
```
