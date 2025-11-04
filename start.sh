#!/bin/bash

# DAIRA Quick Start Script
# This script starts the DAIRA platform using docker compose

set -e

echo "🚀 Starting DAIRA Platform..."
echo ""

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "📦 Building and starting services..."
echo "   This may take 10-15 minutes on first run (npm install is time-consuming)"
echo ""

# Start all services
docker compose up --build -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 20

# Check if API is healthy
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ API is healthy"
else
    echo "⏳ API still starting, waiting..."
    sleep 10
fi

# Seed the database
echo ""
echo "🌱 Seeding database..."
docker compose exec -T api sh -c "cd /app && PYTHONPATH=/app python scripts/seed.py" > /dev/null 2>&1 || {
    echo "   Database might already be seeded, continuing..."
}

echo ""
echo "✅ DAIRA Platform is ready!"
echo ""
echo "🌐 Access the services:"
echo "   - Web App:      http://localhost:3000"
echo "   - API:          http://localhost:8000"
echo "   - GraphQL:      http://localhost:8000/graphql"
echo "   - MinIO Console: http://localhost:9001 (minioadmin/minioadmin)"
echo ""
echo "📊 Check status:"
echo "   docker compose ps"
echo ""
echo "🛑 Stop services:"
echo "   docker compose down"
echo ""
