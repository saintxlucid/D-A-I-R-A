# D-A-I-R-A

D-A-I-R-A is a modular, enterprise-ready social media platform foundation built with NestJS (backend) and React (frontend). This monorepo contains a backend API, frontend UI, database schema, tests, and CI workflows.

Quick links
- Overview: `docs/PROJECT_OVERVIEW.md`
- Developer setup: `docs/DEVELOPMENT.md`
- Tracing & Observability: `docs/TRACING.md`
- CI instructions: `docs/CI.md`
- Observability & troubleshooting: `docs/OBSERVABILITY.md`
- Contributing: `CONTRIBUTING.md`

Getting started
1. Install `pnpm` and Docker
2. Start helper containers: `docker compose up -d postgres redis minio`
3. Set environment variables and install dependencies as described in `docs/DEVELOPMENT.md`
4. Start backend and frontend using `pnpm --filter ./packages/backend... dev` and `pnpm --filter ./web... dev`

Project structure
- `packages/backend/`: NestJS backend
- `web/`: Vite + React frontend
- `packages/backend/prisma`: Prisma schema
- `packages/backend/test`: E2E tests using Jest + supertest
- `docs/`: project docs
- `scripts/`: helper scripts for platform-specific tooling

Contributing
See `CONTRIBUTING.md` for contribution and PR guidelines.

License
See `LICENSE` for licensing details.

