# DAIRA

> Social Media Platform

## Quick Start

1. Clone the repo and install Docker & Docker Compose.
2. Copy `.env.example` to `.env` and fill in your secrets.
3. Run all services:
   ```sh
   docker compose up -d
   ```
4. Access API at http://localhost:4000/health

## Project Structure

```
├── packages/
│   ├── backend/    # NestJS TypeScript API
│   └── frontend/   # Next.js frontend
├── sql/            # Database migrations
├── stack/          # Infrastructure configs
└── web/            # Additional web assets
```

## Development

### Prerequisites
- Node.js 18+
- pnpm

### Install Dependencies
```sh
pnpm install
```

### Run Backend
```sh
cd packages/backend
pnpm start
```

### Run Frontend
```sh
cd packages/frontend
pnpm dev
```

## Testing

```sh
pnpm test        # Unit tests
pnpm e2e         # End-to-end tests
```

## Tech Stack

- **Backend**: NestJS, TypeScript
- **Frontend**: Next.js, React
- **Database**: PostgreSQL
- **Infrastructure**: Docker, Docker Compose

## License

See LICENSE for details.
