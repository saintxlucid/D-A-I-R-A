# Running Backend Tests Locally

This guide helps you run the backend tests locally (Windows PowerShell).

## Pre-requisites
- Docker running
- Postgres and Redis available
- pnpm installed

## Quick start
1. Start dev services using Docker Compose:

```powershell
docker compose up -d postgres redis
```

2. Set environment variables used by tests:

```powershell
$env:DATABASE_URL="postgresql://daira:daira@127.0.0.1:5432/daira_test?schema=public"
$env:REDIS_URL="redis://127.0.0.1:6379"
```

3. If pnpm install fails due to disk space (ENOSPC), free space or configure pnpm store:

```powershell
# Clear pnpm store and cache
pnpm store prune
pnpm store clean
pnpm cache clean --all

# Optionally set a new pnpm store directory on a drive with more space
pnpm config set store-dir "X:\\DAIRA\\pnpm-store"

If you don't already have the folder on X:, create it or use the helper script:

```powershell
# Create the base folder
New-Item -ItemType Directory -Path "X:\\DAIRA" -Force

# Or use the helper script which will create the path and clean the store
.\scripts\fix-pnpm-store.ps1 -StoreDir "X:\\DAIRA\\pnpm-store"
```
```

4. Install dependencies and run backend tests:

```powershell
pnpm install --frozen-lockfile
pnpm -w -r test --filter @daira/backend
```

If the `@daira/backend` filter fails, try path-based filter:

```powershell
pnpm -w -r test --filter ./packages/backend...
```

If you still have trouble, see `docs/git-push-troubleshooting.md` for push/CI issues.
