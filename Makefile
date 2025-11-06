.PHONY: help up down logs restart migrate seed test lint format clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Start all services
	docker compose up -d

build: ## Build all services
	docker compose build

up-build: ## Build and start all services
	docker compose up -d --build

down: ## Stop all services
	docker compose down

down-v: ## Stop all services and remove volumes
	docker compose down -v

logs: ## Show logs from all services
	docker compose logs -f

logs-api: ## Show API logs
	docker compose logs -f api

logs-worker: ## Show worker logs  
	docker compose logs -f worker

restart: ## Restart all services
	docker compose restart

restart-api: ## Restart API service
	docker compose restart api

migrate: ## Run database migrations
	docker compose exec api python -m alembic upgrade head

migrate-create: ## Create a new migration (usage: make migrate-create MESSAGE="description")
	docker compose exec api python -m alembic revision --autogenerate -m "$(MESSAGE)"

migrate-down: ## Rollback last migration
	docker compose exec api python -m alembic downgrade -1

seed: ## Seed database with test data
	docker compose exec api sh -c "cd /app && PYTHONPATH=/app python scripts/seed.py"

test: ## Run tests
	docker compose exec api pytest

test-cov: ## Run tests with coverage
	docker compose exec api pytest --cov=app --cov-report=html --cov-report=term

lint: ## Run linter (ruff)
	docker compose exec api ruff check app/

lint-fix: ## Run linter and fix issues
	docker compose exec api ruff check --fix app/

format: ## Format code with black
	docker compose exec api black app/

typecheck: ## Run type checker (mypy)
	docker compose exec api mypy app/

quality: lint typecheck ## Run all quality checks

shell-api: ## Open shell in API container
	docker compose exec api sh

shell-db: ## Open PostgreSQL shell
	docker compose exec postgres psql -U daira -d daira

shell-redis: ## Open Redis CLI
	docker compose exec redis redis-cli

clean: ## Clean up containers, volumes, and cache
	docker compose down -v
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache .mypy_cache .ruff_cache htmlcov

ps: ## Show running services
	docker compose ps

health: ## Check service health
	@echo "Checking service health..."
	@curl -f http://localhost:8000/health || echo "API not ready"
	@docker compose exec postgres pg_isready -U daira || echo "Postgres not ready"
	@docker compose exec redis redis-cli ping || echo "Redis not ready"

dev: up-build seed ## Full dev setup: build, start, and seed
	@echo "✅ Dev environment ready!"
	@echo "🌐 API: http://localhost:8000"
	@echo "📊 GraphQL: http://localhost:8000/graphql"
	@echo "📱 Web: http://localhost:3000"
