#!/usr/bin/env bash
set -euo pipefail

MAX_TRIES=${MAX_TRIES:-5}
WAIT_MS=${WAIT_MS:-5000}
SCHEMA_PATH=${SCHEMA_PATH:-"packages/backend/prisma/schema.prisma"}
ACCEPT_DATA_LOSS=${ACCEPT_DATA_LOSS:-"--accept-data-loss"}

echo "=========================================="
echo "Prisma Wait & Migrate Script"
echo "=========================================="
echo ""

echo "Waiting for Postgres to be ready..."
tries=0
until pg_isready -q || [ $tries -ge $MAX_TRIES ]; do
  tries=$((tries+1))
  echo "Postgres not ready (try: $tries/$MAX_TRIES). Sleeping..."
  sleep_time=$(awk "BEGIN {print $WAIT_MS/1000 * $tries}")
  sleep $sleep_time
done

if ! pg_isready -q ; then
  echo "❌ Postgres did not become ready after $MAX_TRIES tries."
  exit 1
fi

echo "✓ Postgres ready"
echo "Running prisma generate + db push..."

npx prisma generate --schema="$SCHEMA_PATH"
npx prisma db push $ACCEPT_DATA_LOSS --schema="$SCHEMA_PATH"

echo ""
echo "=========================================="
echo "✓ Prisma migration complete"
echo "=========================================="
