# DAIRA Backend

NestJS-style TypeScript API with strict typing and DI.

## Quickstart
- `pnpm install`
- `pnpm start`

## API Example
POST /auth/signup
Request: `{ "email": "test@example.com", "password": "password" }`
Response: `{ "id": "1", "email": "test@example.com" }`

## Test Plan
- Unit: AuthService signup
- E2E: POST /auth/signup
- Run: `pnpm test` (unit), `pnpm e2e` (E2E)
