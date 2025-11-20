#!/bin/bash
# ci/prisma-wait.sh
# Robust Postgres readiness check + Prisma schema generation/migration
# Used in GitHub Actions CI to ensure DB is ready before Prisma operations

set -e

POSTGRES_HOST="${POSTGRES_HOST:-127.0.0.1}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-daira}"
POSTGRES_DB="${POSTGRES_DB:-daira_test}"
MAX_RETRIES=30
RETRY_INTERVAL=2

echo "🔍 Waiting for Postgres at $POSTGRES_HOST:$POSTGRES_PORT..."

for i in $(seq 1 $MAX_RETRIES); do
  if pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" 2>/dev/null; then
    echo "✅ Postgres is ready (attempt $i/$MAX_RETRIES)"
    break
  fi

  if [ $i -eq $MAX_RETRIES ]; then
    echo "❌ Postgres failed to start after $MAX_RETRIES retries"
    exit 1
  fi

  echo "⏳ Postgres not ready yet (attempt $i/$MAX_RETRIES). Waiting ${RETRY_INTERVAL}s..."
  sleep "$RETRY_INTERVAL"
done

echo "🔄 Generating Prisma client..."
npx prisma generate --schema=packages/backend/prisma/schema.prisma

echo "🗄️  Applying Prisma schema (db push)..."
npx prisma db push --schema=packages/backend/prisma/schema.prisma --accept-data-loss --skip-generate

echo "✅ Prisma setup complete!"
exit 0
