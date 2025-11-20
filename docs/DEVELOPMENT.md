# Development Guide

This guide walks through local development steps, starting services, running tests, and helpful scripts for disk space and package manager issues.

## Prerequisites
- Node.js >= 20 (backend and frontend) and pnpm installed
- Docker & Docker Compose (for Postgres, Redis, MinIO)
- Yarn is not required — this repo uses pnpm workspaces

## Local Environment
1. Start helper containers:

```powershell
# From repository root (PowerShell):
cd C:\Users\TOP\D-A-I-R-A
docker compose up -d postgres redis minio
```

2. Set required environment variables (for Windows PowerShell):

```powershell
$env:DATABASE_URL = "postgresql://daira:daira@127.0.0.1:5432/daira_test?schema=public"
$env:REDIS_URL = "redis://127.0.0.1:6379"
$env:MINIO_ENDPOINT = "http://localhost:9000"
$env:MINIO_BUCKET = "daira-uploads"
$env:JWT_SECRET = "testsecret"
$env:FRONTEND_URL = "http://localhost:5173"
```

3. Fix pnpm store disk space issues on Windows (if you hit `ENOSPC`):

```powershell
# Configure pnpm store and cache on a drive with more space
.\scripts\fix-pnpm-store.ps1 -StoreDir "X:\DAIRA\pnpm-store"
pnpm install --frozen-lockfile
```

4. Install repo dependencies from the workspace root:

```powershell
pnpm install
```

5. Generate Prisma client:

```powershell
npx prisma generate --schema=packages/backend/prisma/schema.prisma
```

6. Apply Prisma schema locally if needed to create db:

```powershell
npx prisma db push --schema=packages/backend/prisma/schema.prisma --accept-data-loss
```

## Running Services Locally

### Backend (NestJS)

```powershell
# Run the backend in development mode
pnpm --filter ./packages/backend... dev
```

### Frontend (Vite)

```powershell
pnpm --filter ./web... dev
```

### Running Tests

```powershell
pnpm -w -r test --filter ./packages/backend...
```

If you only want to run tests in a single package:

```powershell
pnpm -w -r test --filter @daira/backend
```

## Code Formatting & Linters
There is an eslint task — run `pnpm lint` from repo root.

## Notes
- This repo intentionally uses `pnpm` workspaces to reduce duplicated packages on disk
- If you modify prisma models in `packages/backend/prisma/schema.prisma`, run `npx prisma generate` again

For rules about contributing and PR workflow, see `CONTRIBUTING.md`.
