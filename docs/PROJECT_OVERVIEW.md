# D-A-I-R-A — Project Overview

D-A-I-R-A is an enterprise-grade, modular social media platform foundation inspired by Instagram, TikTok, Threads, and Facebook. It's designed for extensibility and observability and uses modern tools and best practices for Node.js/NestJS backends and React frontends.

## Key Components

- Backend (NestJS)
  - Authentication (JWT, refresh tokens, sessions)
  - Posts (CRUD, media attachments)
  - Marketplace modules (likes, comments)
  - Social Graph (follow/unfollow, feed)
  - Realtime (WebSocket gateway with Redis pub/sub)
  - Uploads (S3/MinIO-compatible storage)
  - Tracing (OpenTelemetry bootstrap + exporter configuration)

- Frontend (React + Vite) — in `web/`
  - Pages: login, register, timeline, profile, explore, reels
  - Components and hooks for auth, feed, upload

- Data Layer
  - PostgreSQL with Prisma ORM (`packages/backend/prisma/schema.prisma`)
  - Redis (pub/sub, session / presence caching)
  - MinIO (S3 compatible storage for uploads)

- CI & DevOps
  - pnpm monorepo with workspace packages
  - GitHub Actions workflow: `.github/workflows/backend-ci.yml`

## Repositories & Structure
- `packages/backend/` — NestJS services, modules, and tests
- `web/` — Frontend React UI
- `docs/` — Project documentation
- `sql/` — Database migrations/scripts
- `scripts/` — Helpful scripts for dev & CI (Windows PowerShell helpers)

## Design Principles
- Modular architecture: keep controllers, services, modules separated
- Observable by-default: tracing, logs, and metrics to help debug and optimize
- Secure defaults: JWT, cookie refresh tokens, and protected endpoints using guards
- Test-first: E2E tests are in `packages/backend/test/` using `supertest` + Jest

## Next Extensions
- Analytics & ranking (feed personalization)
- Moderation tooling & content policies
- Multi-tenant support for localized deployments

---

For more details and step-by-step development guidance, see `docs/DEVELOPMENT.md` and `docs/TRACING.md`.