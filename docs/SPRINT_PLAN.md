# D-A-I-R-A MVP Hardening Roadmap (4-Week Sprint Plan)

## 🎯 OVERVIEW

**Goal:** Ship closed beta (1,000 users) with hardened security, moderation, admin tools, and deployment infrastructure.

**Timeline:** 4 weeks | **Team Size:** 8-12 engineers | **Sprint Model:** Weekly 2-day iterations

---

## 📊 SPRINT BOARD SETUP (GitHub Projects - Kanban)

### Columns
- **Backlog** - Not started
- **Ready** - Designed, estimated, ready for pickup
- **In Progress** - Actively being worked (WIP limit: 3 per person)
- **In Review** - Code review, waiting for approval
- **Done** - Merged to main, tested in staging

### Labels
- `epic:frontend` / `epic:email` / `epic:moderation` / `epic:admin` / `epic:security` / `epic:deployment`
- `priority:critical` / `priority:high` / `priority:medium`
- `size:xs` (≤4h) / `size:s` (4-8h) / `size:m` (1-2d) / `size:l` (3-5d)
- `backend` / `frontend` / `devops` / `testing`
- `week:1` / `week:2` / `week:3` / `week:4`

---

## 📅 WEEK 1: Infrastructure Stabilization & CI Hardening

**Owner:** DevOps Lead + Backend Tech Lead
**Goal:** Make CI deterministic; Postgres + Prisma migrations bulletproof; eliminate ENOSPC
**Deadline:** EOD Friday

### ✅ Tickets

#### 1. Fix pnpm ENOSPC (Blocker)
- **Title:** chore(infra): relocate pnpm store to X: drive for CI reliability
- **Description:**
  - Move pnpm store from C: to X: on all CI runners
  - Add .npmrc config to all local machines
  - Document in DEVELOPMENT.md
  - Add script: scripts/fix-pnpm-store-x-drive.ps1 (done ✅)
- **Acceptance Criteria:**
  - pnpm install completes without ENOSPC
  - CI runners have store at X:\pnpm-store
  - All team members run fix script on first setup
- **Estimate:** 4h
- **Assignee:** DevOps
- **Labels:** `epic:deployment`, `priority:critical`, `size:xs`

#### 2. Harden CI with Service Health Checks
- **Title:** ci: add Postgres + Redis health checks, Prisma retry logic
- **Description:**
  - Add pg_isready polling (30s timeout, 5s intervals)
  - Add redis-cli health check
  - Implement Prisma db push with exponential backoff (5 retries)
  - Add timeout: 15min for test job
  - File: .github/workflows/backend-ci.yml (done ✅)
- **Acceptance Criteria:**
  - pg_isready passes before Prisma runs
  - redis-cli ping succeeds
  - Prisma db push retries on transient failure
  - CI completes in <5min for passing tests
  - Failed service health = clear error message
- **Estimate:** 6h
- **Assignee:** DevOps
- **Labels:** `epic:deployment`, `priority:critical`, `size:s`

#### 3. Create ci/prisma-wait.sh
- **Title:** ci: add robust Postgres readiness script
- **Description:**
  - Bash script: ci/prisma-wait.sh
  - Polls pg_isready with configurable retries
  - Runs prisma generate + db push in sequence
  - Exit 1 on failure (CI stops)
  - Done ✅ — just needs testing in CI
- **Acceptance Criteria:**
  - Script runs in GitHub Actions
  - Detects DB readiness correctly
  - Prisma schema applied without error
  - Handles missing pg_isready gracefully
- **Estimate:** 2h
- **Assignee:** DevOps
- **Labels:** `epic:deployment`, `size:xs`

#### 4. Lock Dependencies & Generate pnpm-lock.yaml
- **Title:** chore: regenerate pnpm-lock.yaml with fixed store
- **Description:**
  - Run `pnpm install --frozen-lockfile` locally
  - Commit pnpm-lock.yaml
  - CI uses --frozen-lockfile to prevent version drift
- **Acceptance Criteria:**
  - pnpm-lock.yaml committed
  - CI uses --frozen-lockfile
  - All PRs require exact match
- **Estimate:** 2h
- **Assignee:** Backend Lead
- **Labels:** `epic:deployment`, `size:xs`

#### 5. Add Observability Metrics (Console → Jaeger Local)
- **Title:** feat(observability): export OpenTelemetry traces to Jaeger (local dev)
- **Description:**
  - Add Jaeger exporter to packages/backend/src/tracing.ts
  - Update docker-compose.dev.yml with Jaeger service
  - Configure OpenTelemetry SDK to send to localhost:4318 (OTLP HTTP)
  - Add Jaeger UI link to docs/TRACING.md
- **Acceptance Criteria:**
  - Jaeger container starts with docker-compose up
  - Backend exports spans to Jaeger
  - Traces visible in Jaeger UI (localhost:16686)
  - Span timing and hierarchy correct
- **Estimate:** 4h
- **Assignee:** Backend
- **Labels:** `epic:deployment`, `priority:high`, `size:s`

#### 6. Add Prometheus Metrics (Basic)
- **Title:** feat(monitoring): expose Prometheus metrics endpoint
- **Description:**
  - Add @nestjs/metrics or prom-client to backend
  - Expose /metrics endpoint (only localhost in dev)
  - Track: HTTP latency, request count, error rate, DB query time
  - Update docker-compose.dev.yml with Prometheus + Grafana
  - Sample Grafana dashboard
- **Acceptance Criteria:**
  - /metrics endpoint returns Prometheus format
  - Metrics include: http_request_duration_seconds, http_requests_total, errors_total
  - Grafana dashboard displays key metrics
- **Estimate:** 6h
- **Assignee:** Backend
- **Labels:** `epic:deployment`, `priority:high`, `size:s`

#### 7. E2E Smoke Test (Critical Path)
- **Title:** test: add smoke test suite for auth + posts
- **Description:**
  - Playwright E2E test file: web/e2e/smoke.spec.ts
  - Test scenarios:
    1. Signup → verify response
    2. Login → redirect to feed
    3. Create post → success
    4. Logout → redirect to login
  - Run in CI after successful deploy
- **Acceptance Criteria:**
  - All smoke tests pass locally
  - CI runs smoke tests and reports results
  - Smoke tests complete in <2min
- **Estimate:** 4h
- **Assignee:** Frontend QA
- **Labels:** `epic:frontend`, `priority:critical`, `size:s`

#### 8. CI Documentation
- **Title:** docs: add CI troubleshooting guide + runbook
- **Description:**
  - docs/CI.md — detailed workflow explanation
  - Troubleshooting: common CI failures + fixes
  - Local repro steps for CI issues
  - Metrics dashboard link
- **Acceptance Criteria:**
  - Guide covers pnpm, Prisma, services, tests
  - Includes troubleshooting matrix
  - Clear next steps for each error
- **Estimate:** 3h
- **Assignee:** Tech Lead
- **Labels:** `epic:deployment`, `size:xs`

**Week 1 Summary:**
- ✅ pnpm store fixed + locked
- ✅ CI deterministic (services, retries, timeouts)
- ✅ Observability baseline (Jaeger, Prometheus)
- ✅ Smoke tests automated
- ✅ Clear runbooks for troubleshooting

**KPIs by EOW:**
- CI green rate: 95%+
- pnpm install success: 100%
- Trace export latency: <100ms
- Metrics scrape: <1s

---

## 📅 WEEK 2: Frontend Auth + Core UX

**Owner:** Frontend Lead + UX Designer
**Goal:** Ship signup → login → feed → profile flow
**Deadline:** EOD Friday

### ✅ Tickets

#### 1. Figma Mockups (Design)
- **Title:** design: create high-fidelity mockups for MVP
- **Description:**
  - Auth flows: signup, login, password reset
  - Onboarding: profile creation, avatar upload
  - Feed: timeline, compose, post card, interactions
  - Profile: avatar, bio, follow/unfollow, posts grid
  - Admin: user search, moderation queue (stub)
- **Acceptance Criteria:**
  - Figma file shared with team
  - Mobile + desktop designs
  - Dark mode colors finalized
  - Component library defined
- **Estimate:** 8h
- **Assignee:** UX Designer
- **Labels:** `epic:frontend`, `priority:critical`, `size:m`

#### 2. Component Library Setup
- **Title:** feat(frontend): scaffold component library (Material-UI or Chakra)
- **Description:**
  - Add Material-UI or Chakra UI to web/
  - Create theme: dark mode, Egyptian brand colors
  - Set up Storybook for component docs
  - Base components: Button, Input, Modal, Card
- **Acceptance Criteria:**
  - npm install completes
  - Storybook runs locally
  - 5 base components documented
  - Dark mode theme applied globally
- **Estimate:** 4h
- **Assignee:** Frontend
- **Labels:** `epic:frontend`, `size:s`

#### 3. useAuth Hook + Auth Context
- **Title:** feat(frontend): implement useAuth hook with token refresh
- **Description:**
  - Zustand store for auth state
  - useAuth hook: login, register, logout, refresh
  - Token expiry detection + auto-refresh
  - Clear error messages on failure
  - File: web/src/hooks/useAuth.ts (done ✅ — needs testing)
- **Acceptance Criteria:**
  - useAuth exports all methods
  - Token refresh on expiry works
  - Error messages shown to user
  - No console errors
  - Unit tests pass
- **Estimate:** 4h
- **Assignee:** Frontend
- **Labels:** `epic:frontend`, `priority:high`, `size:s`

#### 4. LoginForm Component (Production-Grade)
- **Title:** feat(frontend): build LoginForm with validation + error handling
- **Description:**
  - React Hook Form + Zod validation
  - Email + password fields
  - Error messages (inline validation)
  - Loading state during submission
  - Link to signup + password reset
  - Tailwind dark mode styling
  - File: web/src/components/auth/LoginForm.tsx (done ✅)
- **Acceptance Criteria:**
  - Form validates on blur
  - API errors shown clearly
  - Submit button disabled during request
  - Loading spinner shown
  - Redirect to feed on success
  - Playwright E2E test passes
- **Estimate:** 4h
- **Assignee:** Frontend
- **Labels:** `epic:frontend`, `priority:high`, `size:s`

#### 5. RegisterForm Component
- **Title:** feat(frontend): build RegisterForm with password strength + email verify
- **Description:**
  - Email + password + confirm password fields
  - Password strength indicator (Zxcvbn)
  - Email verification link flow (stub: mock response)
  - Terms acceptance checkbox
  - Same styling as LoginForm
  - Tailwind dark mode
- **Acceptance Criteria:**
  - Password strength shown
  - Matching password validation
  - Email sent (stub backend: mock 200)
  - Redirect to verification page
  - Playwright test passes
  - Mobile responsive
- **Estimate:** 5h
- **Assignee:** Frontend
- **Labels:** `epic:frontend`, `priority:high`, `size:s`

#### 6. ProtectedRoute Component
- **Title:** feat(frontend): implement ProtectedRoute for authenticated pages
- **Description:**
  - Wrapper component checks isAuthenticated
  - Redirects to /login if not auth
  - Shows loading spinner during auth check
  - Passes children if auth ✓
- **Acceptance Criteria:**
  - Protected routes block unauthenticated users
  - Redirect works smoothly
  - No flash of login page
  - isAuthenticated checked on mount
- **Estimate:** 2h
- **Assignee:** Frontend
- **Labels:** `epic:frontend`, `size:xs`

#### 7. Feed Page (Skeleton)
- **Title:** feat(frontend): create feed page with post list + compose placeholder
- **Description:**
  - GET /posts endpoint (paginated)
  - Display list of posts
  - Compose button (placeholder → Week 3)
  - Post card: author, content, timestamp, like/comment buttons
  - Infinite scroll or pagination
  - Empty state message
- **Acceptance Criteria:**
  - Page loads and fetches posts
  - Posts render with all fields
  - Pagination/infinite scroll works
  - Empty state shown when no posts
  - API errors handled gracefully
- **Estimate:** 6h
- **Assignee:** Frontend
- **Labels:** `epic:frontend`, `priority:high`, `size:m`

#### 8. Profile Page (Skeleton)
- **Title:** feat(frontend): create profile page with avatar + bio + posts grid
- **Description:**
  - GET /users/:id endpoint
  - Display avatar, bio, follower/following counts
  - Posts grid (6 cols responsive)
  - Follow/unfollow button
  - Edit profile button (owner only)
  - Navigation links (followers, following, posts)
- **Acceptance Criteria:**
  - Profile info renders
  - Posts grid displays
  - Follow button works (optimistic update)
  - Mobile responsive
  - Placeholder avatar if missing
- **Estimate:** 6h
- **Assignee:** Frontend
- **Labels:** `epic:frontend`, `priority:high`, `size:m`

#### 9. Playwright E2E Tests (Auth + Feed)
- **Title:** test: add comprehensive E2E tests for user signup → feed
- **Description:**
  - Scenario 1: Signup → email verification stub → login → see feed
  - Scenario 2: Login with existing account → feed loads
  - Scenario 3: Logout → redirected to login
  - Tests in: web/e2e/auth.spec.ts
  - Run in CI with staging backend
- **Acceptance Criteria:**
  - All 3 scenarios pass locally
  - CI runs E2E tests (30s timeout)
  - Failure screenshots saved
  - Test report in CI
- **Estimate:** 5h
- **Assignee:** QA / Frontend
- **Labels:** `epic:frontend`, `priority:high`, `size:m`

#### 10. Frontend Deployment (Vite Build)
- **Title:** build(frontend): configure Vite production build + static hosting
- **Description:**
  - vite.config.ts: optimize build (minify, tree-shake)
  - Output: dist/ folder
  - Environment vars for API endpoint
  - GitHub Actions job: build Vite → upload artifacts
  - Ready for S3/Netlify/Vercel in Week 4
- **Acceptance Criteria:**
  - pnpm build completes without errors
  - dist/ contains all assets
  - API endpoint configurable
  - Build size <500KB (core JS)
  - Build time <60s
- **Estimate:** 3h
- **Assignee:** DevOps / Frontend
- **Labels:** `epic:frontend`, `priority:high`, `size:s`

**Week 2 Summary:**
- ✅ UI mockups finalized
- ✅ Component library ready
- ✅ Auth flows (signup, login, logout) working
- ✅ Feed + profile pages rendering
- ✅ E2E tests passing
- ✅ Build pipeline ready

**KPIs by EOW:**
- User registration flow: <7min
- Login latency: <500ms
- Feed page: <2s load time
- E2E test pass rate: 100%

---

## 📅 WEEK 3: Moderation, Email & Admin Basics

**Owner:** Backend Lead + Product
**Goal:** Ship safety features and account recovery
**Deadline:** EOD Friday

### ✅ Tickets

#### 1. Password Reset Flow (Backend + Email)
- **Title:** feat(auth): implement password reset with tokenized links
- **Description:**
  - POST /auth/request-password-reset (email) → send reset link
  - POST /auth/reset-password (token, newPassword) → verify & update password
  - Token: UUID, 1h expiry, stored hashed in DB
  - Email template: reset-password.html (SendGrid/SES)
  - Rate limit: 5 requests / hour per IP
- **Acceptance Criteria:**
  - Email sent to SendGrid sandbox
  - Reset link valid for 1h
  - Password updated successfully
  - Old sessions revoked (logout everywhere)
  - Playwright E2E: request → link → login with new password
- **Estimate:** 5h
- **Assignee:** Backend
- **Labels:** `epic:email`, `priority:critical`, `size:m`

#### 2. Email Service Integration (SendGrid/SES)
- **Title:** feat(backend): integrate SendGrid for transactional emails
- **Description:**
  - Add SendGrid SDK to packages/backend
  - Env config: SENDGRID_API_KEY
  - Email templates folder: src/templates/emails/
  - Helper: EmailService.send(to, template, data)
  - Templates: reset-password, email-verification, welcome
- **Acceptance Criteria:**
  - SendGrid SDK installed
  - Test email sends in dev (sandbox)
  - Email template renders correctly
  - Retry logic on failure
  - No credentials in code
- **Estimate:** 4h
- **Assignee:** Backend
- **Labels:** `epic:email`, `priority:critical`, `size:s`

#### 3. Moderation Filter (Keyword-Based)
- **Title:** feat(moderation): implement keyword-based content filter + report queue
- **Description:**
  - DB table: ModerationRule (keyword, severity, action)
  - Service: ModerationService.checkContent(text) → flag/allow
  - Auto-action: soft-delete post if flagged (add flag reason)
  - Endpoint: POST /posts/:id/report (user reports)
  - Queue entry: ModerationQueue (post, reporter, reason, timestamp)
  - Admin can review and restore or permanently delete
- **Acceptance Criteria:**
  - Posts with forbidden keywords flagged
  - Soft-delete works (hidden from feed)
  - Report endpoint creates queue entry
  - Admin can list flagged posts
  - Audit log entry created
- **Estimate:** 6h
- **Assignee:** Backend
- **Labels:** `epic:moderation`, `priority:critical`, `size:m`

#### 4. Admin Dashboard (Skeleton - React)
- **Title:** feat(frontend): build admin dashboard for user search + moderation queue
- **Description:**
  - New route: /admin (ProtectedRoute + Admin role check)
  - Components:
    - UserSearch: search by email, list results, action buttons
    - ModerationQueue: list flagged posts, approve/delete buttons
    - AdminStats: total users, flagged posts, reports
  - Tailwind + dark mode
  - API integration: GET /admin/users?search, GET /admin/moderation-queue
- **Acceptance Criteria:**
  - Admin page accessible (hardcoded admin for now)
  - User search works (API call)
  - Moderation queue displays
  - Action buttons functional (API calls)
  - Mobile responsive
- **Estimate:** 6h
- **Assignee:** Frontend
- **Labels:** `epic:admin`, `priority:high`, `size:m`

#### 5. User Disable Endpoint (Backend)
- **Title:** feat(admin): implement user disable/enable for moderation
- **Description:**
  - POST /admin/users/:id/disable (disable user account)
  - POST /admin/users/:id/enable (re-enable)
  - DB column: User.disabled (boolean, default false)
  - Disabled users cannot login (check in auth)
  - All sessions revoked on disable
  - Audit log entry with reason
- **Acceptance Criteria:**
  - Disabled user cannot login
  - Sessions revoked
  - Admin can re-enable
  - Audit trail shows action
- **Estimate:** 3h
- **Assignee:** Backend
- **Labels:** `epic:admin`, `priority:high`, `size:s`

#### 6. Rate Limiting (Auth Endpoints)
- **Title:** feat(security): add Redis-backed rate limiting for auth endpoints
- **Description:**
  - Middleware: RateLimitGuard
  - Limits:
    - POST /auth/login: 10 attempts / 15min per IP
    - POST /auth/signup: 3 accounts / hour per IP
    - POST /auth/request-password-reset: 5 / hour per IP
  - Response: 429 Too Many Requests with Retry-After header
  - Redis key: ratelimit:{endpoint}:{ip}
- **Acceptance Criteria:**
  - Rate limit enforced
  - Exceeding limit returns 429
  - Header Retry-After present
  - Redis key expires correctly
  - Whitelist localhost for testing
- **Estimate:** 3h
- **Assignee:** Backend
- **Labels:** `epic:security`, `priority:high`, `size:s`

#### 7. Security Headers (Helmet.js)
- **Title:** feat(security): add Helmet.js middleware for HTTP security headers
- **Description:**
  - Install @nestjs/helmet
  - Configure in app.module.ts:
    - Content-Security-Policy (CSP)
    - X-Frame-Options: DENY
    - X-Content-Type-Options: nosniff
    - X-XSS-Protection: 1; mode=block
    - Strict-Transport-Security (HSTS)
- **Acceptance Criteria:**
  - Helmet middleware active
  - Security headers in all responses
  - CSP allows only same-origin + CDN
  - No console warnings
  - Headers validated with curl
- **Estimate:** 2h
- **Assignee:** Backend
- **Labels:** `epic:security`, `priority:high`, `size:xs`

#### 8. CORS Hardening
- **Title:** feat(security): harden CORS for frontend-only access
- **Description:**
  - CORS middleware: allow only http://localhost:5173 (dev), https://yourdomain.com (prod)
  - credentials: true (for cookies)
  - methods: GET, POST, PUT, DELETE
  - headers: Content-Type, Authorization
  - Remove: wildcard origins
- **Acceptance Criteria:**
  - Frontend can access API
  - Third-party domains blocked
  - Credentials sent with requests
  - Preflight requests handled
- **Estimate:** 2h
- **Assignee:** Backend
- **Labels:** `epic:security`, `priority:high`, `size:xs`

#### 9. Database Performance Indexes
- **Title:** perf(db): add performance-critical indexes to Prisma schema
- **Description:**
  - Indexes:
    - User.email (unique)
    - Post.authorId, Post.createdAt (composite)
    - Follow(followerId, followingId) (unique exists)
    - Like(userId, postId) (unique exists)
    - Comment.postId, Comment.createdAt
  - Prisma migration: add @@index directives
  - Verify with EXPLAIN ANALYZE on common queries
- **Acceptance Criteria:**
  - Indexes created in DB
  - Prisma schema includes @@index
  - Migration runs cleanly
  - Query plans use indexes
  - No N+1 queries
- **Estimate:** 4h
- **Assignee:** Backend / DevOps
- **Labels:** `epic:deployment`, `priority:high`, `size:s`

#### 10. Load Test (1K Concurrent Users)
- **Title:** test: run k6 load test (1k concurrent, 5min duration)
- **Description:**
  - k6 script: simulate 1k concurrent users
  - Scenarios:
    - 50% view feed (GET /posts?page=1)
    - 30% create post
    - 20% like post
  - Metrics: latency, error rate, throughput
  - Pass criteria: P95 latency <500ms, error rate <1%
  - Output: report + Grafana dashboard
- **Acceptance Criteria:**
  - k6 script runs
  - Latency metrics recorded
  - Error rate <1%
  - Report generated (JSON + HTML)
  - Bottleneck identified (DB / API)
- **Estimate:** 5h
- **Assignee:** QA / DevOps
- **Labels:** `epic:deployment`, `priority:high`, `size:m`

**Week 3 Summary:**
- ✅ Account recovery (password reset) working
- ✅ Email service integrated
- ✅ Moderation filters + queue live
- ✅ Admin dashboard functional
- ✅ Security hardened (rate limit, headers, CORS)
- ✅ Database optimized for scale
- ✅ Load test baseline established

**KPIs by EOW:**
- Password reset flow: <10min
- Moderation queue: auto-flag 95%+ accuracy
- Admin search latency: <200ms
- Load test: 1k concurrent, <500ms P95

---

## 📅 WEEK 4: Deployment & Performance Hardening

**Owner:** DevOps Lead
**Goal:** Staging environment ready; images built; load tested
**Deadline:** EOD Friday

### ✅ Tickets

#### 1. Multi-Stage Docker Builds (Backend + Frontend)
- **Title:** build(docker): create production Dockerfiles for backend and frontend
- **Description:**
  - Backend: packages/backend/Dockerfile
    - Stage 1: Build (node:20, pnpm build)
    - Stage 2: Runtime (distroless node, copy dist)
    - Size target: <300MB
  - Frontend: web/Dockerfile
    - Stage 1: Build (node:20, pnpm build)
    - Stage 2: Runtime (nginx, copy dist)
    - Size target: <100MB
  - .dockerignore: exclude node_modules, test files, docs
- **Acceptance Criteria:**
  - Both images build without error
  - Image sizes under targets
  - Containers start cleanly
  - Health checks pass
- **Estimate:** 4h
- **Assignee:** DevOps
- **Labels:** `epic:deployment`, `priority:critical`, `size:s`

#### 2. Kubernetes Manifests (Staging)
- **Title:** infra(k8s): create Kubernetes manifests for staging deployment
- **Description:**
  - Files in k8s/staging/:
    - deployment-backend.yaml
    - deployment-frontend.yaml
    - service-backend.yaml
    - service-frontend.yaml
    - configmap.yaml (env vars)
    - secret.yaml (tokens, DB password)
    - ingress.yaml (domain routing)
  - Resources: CPU/memory requests + limits
  - Health checks: liveness + readiness probes
  - Replicas: 2 for HA
- **Acceptance Criteria:**
  - Manifests validate with kubectl apply --dry-run
  - All required fields present
  - Health probes configured
  - No hardcoded secrets
- **Estimate:** 6h
- **Assignee:** DevOps
- **Labels:** `epic:deployment`, `priority:critical`, `size:m`

#### 3. Terraform Skeleton (EKS or GKE)
- **Title:** infra(terraform): scaffold Terraform for managed Kubernetes
- **Description:**
  - Choice: AWS EKS or Google GKE
  - Terraform files in tf/:
    - main.tf (provider, cluster)
    - variables.tf (region, cluster size)
    - outputs.tf (cluster endpoint, kubeconfig)
    - README.md (setup steps)
  - One command: `terraform apply` → cluster ready
  - Estimated cost: $500/month (3-node cluster)
- **Acceptance Criteria:**
  - Terraform plan runs
  - All resources defined
  - No hardcoded values
  - Dry-run successful
- **Estimate:** 5h
- **Assignee:** DevOps
- **Labels:** `epic:deployment`, `priority:high`, `size:m`

#### 4. GitHub Actions for Staging Deploy
- **Title:** ci(cd): add GitHub Actions workflow to deploy to staging K8s
- **Description:**
  - Trigger: push to develop branch
  - Steps:
    1. Build Docker images (backend + frontend)
    2. Push to Docker registry (ECR or GCR)
    3. Update K8s manifests with new image tags
    4. Deploy to staging namespace with kubectl apply
    5. Run health checks (curl /health)
    6. Smoke tests via Playwright
  - Rollback on failure
- **Acceptance Criteria:**
  - Workflow file: .github/workflows/deploy-staging.yml
  - Images pushed to registry
  - Kubernetes updated
  - Smoke tests pass
  - Rollback works
- **Estimate:** 5h
- **Assignee:** DevOps
- **Labels:** `epic:deployment`, `priority:critical`, `size:m`

#### 5. Secrets Management (env vars, credentials)
- **Title:** infra: implement secrets management (Sealed Secrets or Vault)
- **Description:**
  - Choose: Kubernetes Sealed Secrets or HashiCorp Vault
  - Store: DATABASE_URL, JWT_SECRET, SENDGRID_KEY, AWS_KEY, etc.
  - No plaintext secrets in git
  - CI/CD can decrypt in namespace
  - Documentation: how to add new secret
- **Acceptance Criteria:**
  - Secrets encrypted in git
  - Decryption works in CI
  - Pods read secrets from Secret objects
  - New secrets can be added safely
- **Estimate:** 3h
- **Assignee:** DevOps
- **Labels:** `epic:deployment`, `priority:critical`, `size:s`

#### 6. Database Persistence (PostgreSQL HA)
- **Title:** infra: configure PostgreSQL with persistent volumes + backups
- **Description:**
  - Persistent volume claim (PVC) for Postgres data
  - Automated daily backups to S3 (pg_dump + Kubernetes job)
  - Restore procedure documented
  - Point-in-time recovery enabled
- **Acceptance Criteria:**
  - PVC provisioned
  - Data survives pod restart
  - Backup job runs daily
  - Restore tested
- **Estimate:** 4h
- **Assignee:** DevOps
- **Labels:** `epic:deployment`, `priority:high`, `size:m`

#### 7. Monitoring + Alerting (Prometheus + Alertmanager)
- **Title:** ops: set up Prometheus + Alertmanager for production monitoring
- **Description:**
  - Prometheus scrapes metrics from /metrics
  - Alert rules: 5xx error rate >1%, latency P95 >1000ms, Pod CrashLoopBackOff
  - Alertmanager: send to Slack + email on alerts
  - Grafana dashboard: system health, pod status, error rates
- **Acceptance Criteria:**
  - Prometheus collects metrics
  - Grafana dashboard renders
  - Alert rule triggers on threshold
  - Notification sent to Slack
- **Estimate:** 5h
- **Assignee:** DevOps
- **Labels:** `epic:deployment`, `priority:high`, `size:m`

#### 8. CDN & Static Assets (CloudFront/Cloudflare)
- **Title:** infra: configure CDN for frontend + media caching
- **Description:**
  - Frontend: S3 + CloudFront (gzip, cache 1 year for versioned assets)
  - Media: MinIO → CloudFront (media cache 30 days)
  - Invalidation: auto-invalidate on deploy
  - Security: signed URLs for private assets
- **Acceptance Criteria:**
  - CDN distributes assets globally
  - Cache headers set correctly
  - Invalidation works
  - Latency reduced (compare before/after)
- **Estimate:** 4h
- **Assignee:** DevOps
- **Labels:** `epic:deployment`, `priority:high`, `size:s`

#### 9. Staging Deploy + Smoke Tests
- **Title:** deploy: ship staging environment with E2E tests
- **Description:**
  - Deploy all services to staging K8s
  - Run Playwright E2E test suite
  - Verify: auth flow, feed load, post creation, moderation
  - Document staging URL + admin credentials
  - Create runbook for manual scaling
- **Acceptance Criteria:**
  - All services running in staging
  - E2E tests pass
  - Staging accessible via public URL
  - Load test targets staging (not prod)
  - Rollback tested
- **Estimate:** 4h
- **Assignee:** DevOps / QA
- **Labels:** `epic:deployment`, `priority:critical`, `size:m`

#### 10. Documentation: Deployment Runbook
- **Title:** docs: create production deployment guide + troubleshooting
- **Description:**
  - docs/DEPLOYMENT.md:
    - Prerequisites (AWS/GCP account, Terraform, kubectl)
    - Step-by-step: terraform apply → deploy K8s
    - Scaling procedures
    - Rollback steps
    - Health checks
    - Common issues + fixes
  - Incident response playbook
- **Acceptance Criteria:**
  - Guide is complete + tested
  - Runbook is clear + unambiguous
  - New team member can follow it
- **Estimate:** 3h
- **Assignee:** DevOps / Tech Lead
- **Labels:** `epic:deployment`, `size:s`

**Week 4 Summary:**
- ✅ Multi-stage Docker builds ready
- ✅ Kubernetes manifests in place
- ✅ Terraform skeleton created
- ✅ GitHub Actions CI/CD to staging working
- ✅ Secrets management implemented
- ✅ Monitoring + alerting live
- ✅ Staging environment fully operational
- ✅ Load tested + documented

**KPIs by EOW:**
- Staging deploy: <5min
- Smoke test pass rate: 100%
- Latency P95: <500ms
- Error rate: <0.1%
- Alerting latency: <2min

---

## 📌 CRITICAL PATH DEPENDENCIES

```
Week 1: CI Stability
    ↓
Week 2: Frontend Auth + Feed (depends on stable CI)
    ↓
Week 3: Moderation + Admin (depends on frontend being testable)
    ↓
Week 4: Deployment (depends on all code stable)
```

---

## 👥 TEAM ASSIGNMENTS (Suggested)

| Role | Week 1 | Week 2 | Week 3 | Week 4 |
|------|--------|--------|--------|--------|
| **DevOps Lead** | pnpm, CI hardens | Monitor CI | DB indexes, load test | Docker, K8s, Terraform |
| **Backend Lead** | Observability | useAuth review | Moderation, email, security | Load testing, monitoring |
| **Frontend Lead** | Smoke tests | LoginForm, feed | Admin dashboard | Frontend deploy |
| **UX Designer** | CI docs | Figma mockups | Moderation UI | Final polish |
| **QA Engineer** | E2E setup | Auth E2E tests | Load test | Staging validation |

---

## 🎯 SUCCESS CRITERIA (End of Week 4)

✅ **Closed Beta Ready:**
- 1,000 user accounts can signup/login
- Feed displays posts from followed users
- Moderation queue catches spam/abuse
- Admin dashboard functional
- Security hardened (rate limit, headers, CORS)
- Staging environment deployable in <5min
- All services monitored with alerts
- Runbooks written

✅ **Code Quality:**
- 90%+ test pass rate
- <1% error rate under 1k concurrent load
- P95 latency <500ms
- Zero critical security issues

✅ **Team Readiness:**
- New developer onboarding time: <2h
- Incident response <15min
- Deployment confidence: high

---

## 📊 METRICS TO TRACK

- **CI Stability:** green rate per day
- **Feature Delivery:** tickets closed per week
- **Performance:** API latency, error rate, throughput
- **Security:** vulnerabilities, failed login attempts
- **User Experience:** signup time, feed load time, error messages
- **Ops:** deploy time, rollback success rate, monitoring coverage

---

**Next Step:** Copy these tickets into GitHub Issues, assign owners, and begin Week 1 on Monday. 🚀
