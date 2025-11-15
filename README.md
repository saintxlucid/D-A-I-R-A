<<<<<<< HEAD
# DAIRA Project

## Quick Start

1. Clone the repo and install Docker & Docker Compose.
2. Copy `.env.example` to `.env` and fill secrets.
3. Run all services:
   ```sh
   docker compose up -d
   ```
4. Access API at http://localhost:4000/health

## Structure
- `backend/` — FastAPI, workers, migrations, config
- `web/` — Frontend (React/Vite)
- `sql/` — DB migrations
- `docs/` — Architecture, API, features

## Backend Setup
- Python 3.10+
- Install dependencies:
   ```sh
   pip install -r backend/requirements.txt
   ```
- Run API locally:
   ```sh
   uvicorn app:app --reload --port 4000
   ```

## Testing
- Run tests:
   ```sh
   pytest backend/tests
   ```
=======
# D-A-I-R-A
Social Media Platform
>>>>>>> 5fac14aec2e889d20d335ab83a75465820e48f96
