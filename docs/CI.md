# CI / GitHub Actions — Backend

The backend CI workflow is defined in `.github/workflows/backend-ci.yml` and runs unit & e2e tests.

Important steps in the workflow:
- Setup Node.js environment
- Install `pnpm` and dependencies
- `npx prisma generate` to generate client
after installing dependencies
- Wait for the Postgres service to be ready before applying Prisma schema
- Execute `pnpm -w -r test --filter ./packages/backend...` to run the backend tests

Environment variables used by the workflow:
- `DATABASE_URL` — Postgres connection string used for tests
- `REDIS_URL` — Redis connection string
- `FRONTEND_URL` — CORS origin allowed for API access
- `JWT_SECRET` — used to issue test JWTs

CI Troubleshooting
- If the install step fails with disk space or network errors, check the runner's environment or try increasing the runner ephemeral disk, or use a smaller dependency set.
- The `backend-ci` workflow uses pinned images and `node-version: 20`. If you plan to change Node version, update the workflow.

Running locally (a simplified run following CI):

```powershell
# From the repository root:
pnpm install --frozen-lockfile
npx prisma generate --schema=packages/backend/prisma/schema.prisma
# Run tests for backend only
pnpm -w -r test --filter ./packages/backend...
```
