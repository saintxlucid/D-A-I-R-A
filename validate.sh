#!/bin/bash
# Final validation script for DAIRA monorepo

set -e

echo "🚀 DAIRA Monorepo - Final Validation"
echo "===================================="
echo ""

# Check Docker services
echo "📦 Checking Docker services..."
SERVICES=$(docker ps --filter "name=daira-" --format "{{.Names}}" | wc -l)
if [ "$SERVICES" -ge 4 ]; then
    echo "✅ All $SERVICES infrastructure services are running"
    docker ps --filter "name=daira-" --format "table {{.Names}}\t{{.Status}}"
else
    echo "❌ Some services are not running. Expected 4, found $SERVICES"
    exit 1
fi
echo ""

# Check database
echo "📊 Checking database..."
DB_CHECK=$(docker exec daira-postgres psql -U daira -d daira -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')
if [ "$DB_CHECK" -ge 1 ]; then
    echo "✅ Database has $DB_CHECK users (seed data loaded)"
else
    echo "❌ Database check failed"
    exit 1
fi
echo ""

# Check API health
echo "🔧 Checking API..."
cd apps/api
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/api_test.log 2>&1 &
API_PID=$!
sleep 3

HEALTH_CHECK=$(curl -s http://localhost:8000/health)
if echo "$HEALTH_CHECK" | grep -q "true"; then
    echo "✅ API health check passed: $HEALTH_CHECK"
else
    echo "❌ API health check failed"
    kill $API_PID 2>/dev/null || true
    exit 1
fi

# Check GraphQL
GRAPHQL_CHECK=$(curl -s -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}')
if echo "$GRAPHQL_CHECK" | grep -q "Query"; then
    echo "✅ GraphQL endpoint is accessible"
else
    echo "❌ GraphQL endpoint check failed"
    kill $API_PID 2>/dev/null || true
    exit 1
fi

kill $API_PID 2>/dev/null || true
cd ../..
echo ""

# Check web dependencies
echo "🌐 Checking web app..."
if [ -f "apps/web/package.json" ] && [ -f "apps/web/next.config.js" ]; then
    echo "✅ Web app configuration files present"
else
    echo "❌ Web app files missing"
    exit 1
fi
echo ""

# Check documentation
echo "📚 Checking documentation..."
DOCS=("README.md" "docs/BRAND.md" "docs/UX.md" "docs/MODERATION.md" "docs/ARCHITECTURE.md" "docs/CONTRIBUTING.md" "docs/CODE_OF_CONDUCT.md")
MISSING=0
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo "✅ $doc"
    else
        echo "❌ $doc missing"
        MISSING=$((MISSING + 1))
    fi
done

if [ $MISSING -eq 0 ]; then
    echo "✅ All documentation files present"
else
    echo "❌ $MISSING documentation files missing"
    exit 1
fi
echo ""

# Check CI/CD
echo "⚙️  Checking CI/CD..."
if [ -f ".github/workflows/ci.yml" ] && [ -f ".github/PULL_REQUEST_TEMPLATE.md" ]; then
    echo "✅ CI/CD workflows and templates configured"
else
    echo "❌ CI/CD files missing"
    exit 1
fi
echo ""

echo "✨ All validation checks passed!"
echo "================================"
echo ""
echo "The DAIRA monorepo is fully functional and ready for development."
echo ""
echo "Quick start:"
echo "  docker compose -f infra/docker-compose.yml up -d"
echo "  cd apps/api && alembic upgrade head && python scripts/seed.py"
echo "  uvicorn app.main:app --reload"
echo ""
