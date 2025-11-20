# GitHub Issues Templates (Copy-Paste Ready)

## 🎯 ISSUE TEMPLATE FORMAT
Use this structure for each ticket. Copy the entire block, paste into GitHub Issues "Create Issue", and fill in custom details.

---

## WEEK 1: INFRASTRUCTURE STABILIZATION

### Issue 1: Fix pnpm ENOSPC (Blocker)
```
Title: chore(infra): relocate pnpm store to X: drive for CI reliability

Labels: epic:deployment, priority:critical, size:xs, week:1

Assignee: @devops-lead

## Description

Move pnpm store from C: to X: on all CI runners to prevent ENOSPC errors during install.

## Tasks

- [ ] Run `scripts/fix-pnpm-store-x-drive.ps1` on all local machines
- [ ] Update `.npmrc` with X:\pnpm-store path
- [ ] Verify `pnpm install` completes without ENOSPC
- [ ] Update docs/DEVELOPMENT.md with pnpm setup steps
- [ ] CI runners use X: drive by default (GitHub Actions)
- [ ] Add .gitignore entry: `/node_modules`

## Acceptance Criteria

- [ ] pnpm install succeeds locally
- [ ] CI runners have store at X:\pnpm-store
- [ ] All team members run fix script on first setup
- [ ] No ENOSPC errors in last 10 CI runs

## Estimate
4 hours

## Notes
- Script already created: scripts/fix-pnpm-store-x-drive.ps1
- Verify X: drive has 50GB+ free space
```

### Issue 2: Harden CI with Service Health Checks
```
Title: ci: add Postgres + Redis health checks, Prisma retry logic

Labels: epic:deployment, priority:critical, size:s, week:1

Assignee: @devops-lead

## Description

Upgrade GitHub Actions workflow to include robust service health checks and Prisma retry logic.

## Tasks

- [ ] Add pg_isready polling before Prisma runs (30s timeout, 5s intervals)
- [ ] Add redis-cli health check (ping)
- [ ] Implement Prisma db push with exponential backoff (5 retries)
- [ ] Set timeout: 15min for test job
- [ ] Update .github/workflows/backend-ci.yml (done ✅ — validate)
- [ ] Add clear error messages when services fail

## Acceptance Criteria

- [ ] pg_isready passes before Prisma runs
- [ ] redis-cli ping succeeds
- [ ] Prisma db push retries on transient failure
- [ ] CI completes in <5min for passing tests
- [ ] Failed service health produces clear error message
- [ ] No flaky tests due to timing issues

## Estimate
6 hours

## Testing
- Push dummy change, watch CI run
- Verify health checks pass
- Simulate DB delay, check retries work
```

### Issue 3: Lock Dependencies & Generate pnpm-lock.yaml
```
Title: chore: regenerate pnpm-lock.yaml with fixed store

Labels: epic:deployment, priority:critical, size:xs, week:1

Assignee: @backend-lead

## Description

Lock all dependencies by generating and committing pnpm-lock.yaml.

## Tasks

- [ ] Run `pnpm install --frozen-lockfile` locally (with fixed store)
- [ ] Commit pnpm-lock.yaml to git
- [ ] Update CI to use --frozen-lockfile
- [ ] Ensure all PRs require exact dependency versions

## Acceptance Criteria

- [ ] pnpm-lock.yaml committed
- [ ] CI uses --frozen-lockfile flag
- [ ] All PRs require lockfile consistency
- [ ] No version drift between environments

## Estimate
2 hours

## Notes
- Lockfile should be ~5MB (normal for monorepo)
- Review for security advisories before merge
```

### Issue 4: Add Observability Metrics (Jaeger Export)
```
Title: feat(observability): export OpenTelemetry traces to Jaeger (local dev)

Labels: epic:deployment, priority:high, size:s, week:1

Assignee: @backend-engineer

## Description

Export traces from OpenTelemetry to local Jaeger instance for distributed tracing visualization.

## Tasks

- [ ] Add Jaeger exporter to packages/backend/src/tracing.ts
- [ ] Update docker-compose.dev.yml with Jaeger service (jaeger:latest)
- [ ] Configure OpenTelemetry SDK to send to localhost:4318 (OTLP HTTP)
- [ ] Add Jaeger UI link to docs/TRACING.md
- [ ] Test: start docker-compose, trigger API request, check Jaeger UI

## Acceptance Criteria

- [ ] Jaeger container starts with `docker-compose up`
- [ ] Backend exports spans to Jaeger
- [ ] Traces visible in Jaeger UI (http://localhost:16686)
- [ ] Span timing and hierarchy correct
- [ ] No configuration hardcoding

## Estimate
4 hours

## Testing
\`\`\`bash
docker-compose up jaeger
curl http://localhost:4000/posts # Generate span
# Visit http://localhost:16686 and search for traces
\`\`\`

## Related
- docs/TRACING.md
- packages/backend/src/tracing.ts
```

### Issue 5: Add Prometheus Metrics (Basic)
```
Title: feat(monitoring): expose Prometheus metrics endpoint

Labels: epic:deployment, priority:high, size:s, week:1

Assignee: @backend-engineer

## Description

Expose Prometheus-formatted metrics for system monitoring.

## Tasks

- [ ] Install prom-client or @nestjs/metrics
- [ ] Create /metrics endpoint (allow only localhost in dev)
- [ ] Track: HTTP latency, request count, error rate, DB query time
- [ ] Update docker-compose.dev.yml with Prometheus + Grafana
- [ ] Create sample Grafana dashboard
- [ ] Test: curl http://localhost:4000/metrics

## Acceptance Criteria

- [ ] /metrics endpoint returns Prometheus format
- [ ] Metrics include: http_request_duration_seconds, http_requests_total, errors_total
- [ ] Grafana dashboard displays key metrics
- [ ] No performance impact (<1% latency increase)
- [ ] Metrics persist across restarts

## Estimate
6 hours

## Metrics to Expose
- http_request_duration_seconds (histogram)
- http_requests_total (counter)
- errors_total (counter)
- db_query_duration_seconds (histogram)
- redis_operation_duration_seconds (histogram)

## Testing
\`\`\`bash
curl http://localhost:4000/metrics | grep http_requests_total
\`\`\`
```

---

## WEEK 2: FRONTEND AUTH + UX

### Issue 6: Figma Mockups (Design)
```
Title: design: create high-fidelity mockups for MVP UX

Labels: epic:frontend, priority:critical, size:m, week:2

Assignee: @ux-designer

## Description

Create comprehensive Figma mockups for all user-facing pages and flows.

## Tasks

- [ ] Auth flows: signup, login, password reset, email verification
- [ ] Onboarding: profile creation, avatar upload, bio
- [ ] Feed: timeline, compose modal, post card, interactions
- [ ] Profile: avatar, bio, follow/unfollow, posts grid
- [ ] Admin: user search, moderation queue (stub)
- [ ] Create dark mode theme (Egyptian brand colors)
- [ ] Mobile + desktop layouts
- [ ] Component inventory for design system

## Acceptance Criteria

- [ ] Figma file shared with team
- [ ] All screens designed
- [ ] Mobile responsive views included
- [ ] Dark mode colors finalized
- [ ] Component library defined
- [ ] Links/flows documented

## Estimate
8 hours

## Output
- Figma link: [shared with team]
- Colors defined
- Typography scale established
- Component specs documented
```

### Issue 7: LoginForm Component (Production-Grade)
```
Title: feat(frontend): build LoginForm with validation + error handling

Labels: epic:frontend, priority:high, size:s, week:2

Assignee: @frontend-engineer

## Description

Build production-ready login form component with validation, error handling, and accessibility.

## Tasks

- [ ] Create web/src/components/auth/LoginForm.tsx
- [ ] Implement React Hook Form + Zod validation
- [ ] Add email + password fields with validation rules
- [ ] Show inline error messages
- [ ] Loading state during submission
- [ ] Display API errors clearly
- [ ] Link to signup + password reset
- [ ] Tailwind dark mode styling
- [ ] Mobile responsive
- [ ] Write Playwright E2E test

## Acceptance Criteria

- [ ] Form validates on blur
- [ ] API errors shown clearly
- [ ] Submit button disabled during request
- [ ] Loading spinner displayed
- [ ] Redirect to feed on success
- [ ] Playwright E2E test passes
- [ ] Accessible (ARIA labels, keyboard nav)
- [ ] No console errors/warnings

## Estimate
4 hours

## File Changes
- web/src/components/auth/LoginForm.tsx (created)
- web/e2e/auth.spec.ts (add test)

## Testing
\`\`\`bash
pnpm -C web test:e2e
# Scenario: type email, password, submit, wait for redirect
\`\`\`

## Design Reference
See Figma: [link] Auth flow

## Related
- Figma mockups (Issue #XXX)
- useAuth hook (Issue #XXX)
```

### Issue 8: RegisterForm Component
```
Title: feat(frontend): build RegisterForm with password strength + email verification

Labels: epic:frontend, priority:high, size:s, week:2

Assignee: @frontend-engineer

## Description

Build registration form with password strength indicator and email verification.

## Tasks

- [ ] Create web/src/components/auth/RegisterForm.tsx
- [ ] Email + password + confirm password fields
- [ ] Add password strength indicator (Zxcvbn)
- [ ] Validate matching passwords
- [ ] Email verification link flow (stub: mock response)
- [ ] Terms acceptance checkbox
- [ ] Same styling as LoginForm
- [ ] Tailwind dark mode
- [ ] Mobile responsive
- [ ] Playwright E2E test

## Acceptance Criteria

- [ ] Password strength meter shows
- [ ] Matching password validation works
- [ ] Email sent (stub: mock 200 response)
- [ ] Redirect to verification page
- [ ] Playwright test passes
- [ ] No console errors
- [ ] Mobile responsive

## Estimate
5 hours

## File Changes
- web/src/components/auth/RegisterForm.tsx (created)
- web/e2e/auth.spec.ts (add test)

## Password Strength Rules
- Length: 8+ chars
- Mix: uppercase + lowercase + number + symbol
- Score: weak (0-1), fair (2), good (3), strong (4)

## Testing
\`\`\`bash
pnpm -C web test:e2e
# Scenario: weak password → error, strong password → success
\`\`\`
```

### Issue 9: Feed Page (Skeleton)
```
Title: feat(frontend): create feed page with post list + compose placeholder

Labels: epic:frontend, priority:high, size:m, week:2

Assignee: @frontend-engineer

## Description

Build feed page displaying paginated posts from followed users.

## Tasks

- [ ] Create web/src/pages/Feed.tsx
- [ ] Fetch GET /posts (paginated)
- [ ] Display post list with infinite scroll or pagination
- [ ] Post card: author, content, timestamp, like/comment buttons
- [ ] Compose button (placeholder → Week 3)
- [ ] Empty state message ("No posts yet")
- [ ] API error handling
- [ ] Loading spinner
- [ ] Mobile responsive
- [ ] Playwright E2E test

## Acceptance Criteria

- [ ] Page loads and fetches posts
- [ ] Posts render with all fields
- [ ] Pagination/infinite scroll works
- [ ] Empty state shown when no posts
- [ ] API errors handled gracefully
- [ ] Loading state visible
- [ ] Mobile responsive

## Estimate
6 hours

## API Endpoint
GET /posts?page=1&limit=20
Response:
\`\`\`json
{
  "data": [
    {
      "id": "uuid",
      "content": "string",
      "authorId": "uuid",
      "author": { "email": "user@example.com" },
      "createdAt": "ISO8601",
      "likes": 5,
      "comments": 2
    }
  ],
  "pagination": { "page": 1, "total": 100 }
}
\`\`\`

## Testing
\`\`\`bash
pnpm -C web test:e2e
# Scenario: login → feed loads → posts displayed
\`\`\`

## Design Reference
See Figma: [link] Feed page
```

### Issue 10: Profile Page (Skeleton)
```
Title: feat(frontend): create profile page with avatar + bio + posts grid

Labels: epic:frontend, priority:high, size:m, week:2

Assignee: @frontend-engineer

## Description

Build user profile page displaying user info, posts grid, and follow button.

## Tasks

- [ ] Create web/src/pages/Profile.tsx
- [ ] Fetch GET /users/:id
- [ ] Display avatar, bio, follower/following counts
- [ ] Posts grid (6 cols responsive, 2 on mobile)
- [ ] Follow/unfollow button
- [ ] Edit profile button (owner only)
- [ ] Navigation: followers, following, posts
- [ ] Placeholder avatar if missing
- [ ] Mobile responsive
- [ ] Playwright E2E test

## Acceptance Criteria

- [ ] Profile info renders
- [ ] Posts grid displays correctly
- [ ] Follow button works (optimistic update)
- [ ] Edit button shows only for owner
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Fast load time (<1s)

## Estimate
6 hours

## API Endpoints
- GET /users/:id
- POST /follow/:id (follow)
- DELETE /follow/:id (unfollow)
- GET /posts?authorId=:id (user posts)

## Testing
\`\`\`bash
pnpm -C web test:e2e
# Scenario: navigate to profile → info loads → follow works
\`\`\`

## Design Reference
See Figma: [link] Profile page
```

---

## WEEK 3: MODERATION, EMAIL & ADMIN

### Issue 11: Password Reset Flow (Backend + Email)
```
Title: feat(auth): implement password reset with tokenized links

Labels: epic:email, priority:critical, size:m, week:3

Assignee: @backend-engineer

## Description

Implement complete password reset flow with email verification.

## Tasks

- [ ] Add POST /auth/request-password-reset (email) → send reset link
- [ ] Add POST /auth/reset-password (token, newPassword) → update password
- [ ] Store token: UUID, hashed, 1h expiry
- [ ] Create email template: reset-password.html (SendGrid)
- [ ] Revoke old sessions on password change
- [ ] Add rate limiting: 5 requests / hour per IP
- [ ] Write E2E test: request → verify email link → reset → login

## Acceptance Criteria

- [ ] Email sent to SendGrid sandbox
- [ ] Reset link valid for 1 hour only
- [ ] Password updated successfully
- [ ] Old sessions revoked (logout everywhere)
- [ ] Playwright E2E: request → link → new login works
- [ ] Rate limiting enforced
- [ ] Audit log entry created

## Estimate
5 hours

## DB Changes
- Add ResetToken table (token, userId, expiresAt, used)
- Migration file: prisma/migrations/add_reset_tokens.sql

## API Endpoints
- POST /auth/request-password-reset { email }
  - Response: { message: "Check your email" }
- POST /auth/reset-password { token, newPassword }
  - Response: { message: "Password updated" }

## Testing
\`\`\`bash
# Trigger: POST /auth/request-password-reset
# Check SendGrid sandbox for email
# Extract link, call POST /auth/reset-password
# Login with new password
\`\`\`

## Related
- Email service integration (Issue #XXX)
```

### Issue 12: Email Service Integration (SendGrid)
```
Title: feat(backend): integrate SendGrid for transactional emails

Labels: epic:email, priority:critical, size:s, week:3

Assignee: @backend-engineer

## Description

Set up SendGrid integration for sending transactional emails.

## Tasks

- [ ] Install SendGrid SDK: npm install @sendgrid/mail
- [ ] Create src/services/EmailService.ts
- [ ] Set env: SENDGRID_API_KEY
- [ ] Create email templates in src/templates/emails/
  - reset-password.html
  - email-verification.html
  - welcome.html
- [ ] Helper: EmailService.send(to, template, data)
- [ ] Add retry logic on failure
- [ ] Test sending in dev (sandbox mode)

## Acceptance Criteria

- [ ] SendGrid SDK installed
- [ ] Test email sends in dev (sandbox)
- [ ] Email template renders correctly
- [ ] Retry logic on failure
- [ ] No credentials in code (use env)
- [ ] Logs show send success/failure

## Estimate
4 hours

## File Structure
\`\`\`
src/
├── services/
│   └── EmailService.ts
├── templates/
│   └── emails/
│       ├── reset-password.html
│       ├── email-verification.html
│       └── welcome.html
└── ...
\`\`\`

## Usage Example
\`\`\`typescript
await EmailService.send(
  'user@example.com',
  'reset-password.html',
  { resetLink: 'https://...', expiresIn: '1 hour' }
)
\`\`\`

## Testing
\`\`\`bash
curl -X POST http://localhost:4000/auth/request-password-reset \
  -d '{"email":"test@example.com"}' \
  -H 'Content-Type: application/json'
# Check SendGrid sandbox: https://app.sendgrid.com/email_testing
\`\`\`

## Related
- Password reset flow (Issue #XXX)
```

### Issue 13: Moderation Filter (Keyword-Based)
```
Title: feat(moderation): implement keyword-based content filter + report queue

Labels: epic:moderation, priority:critical, size:m, week:3

Assignee: @backend-engineer

## Description

Build keyword-based moderation system with auto-flagging and manual review queue.

## Tasks

- [ ] Create DB tables: ModerationRule, ModerationQueue
- [ ] Create src/services/ModerationService.ts
- [ ] Implement checkContent(text) → flag/allow
- [ ] Auto-flag posts containing keywords (soft-delete)
- [ ] Add POST /posts/:id/report endpoint
- [ ] Admin can list flagged posts (GET /admin/moderation-queue)
- [ ] Admin can approve/restore/delete posts
- [ ] Audit log entries for all actions
- [ ] E2E test: create post → auto-flag → admin review → delete

## Acceptance Criteria

- [ ] Posts with forbidden keywords auto-flagged
- [ ] Soft-delete works (hidden from feed)
- [ ] Report endpoint creates queue entry
- [ ] Admin can list flagged posts
- [ ] Audit log tracks all moderation actions
- [ ] E2E test passes
- [ ] Flagged posts not visible to other users

## Estimate
6 hours

## DB Schema
\`\`\`sql
CREATE TABLE ModerationRule (
  id UUID PRIMARY KEY,
  keyword VARCHAR(255) NOT NULL,
  severity ENUM('low', 'medium', 'high'),
  action ENUM('flag', 'delete'),
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ModerationQueue (
  id UUID PRIMARY KEY,
  postId UUID NOT NULL,
  reporterId UUID,
  reason VARCHAR(500),
  status ENUM('pending', 'approved', 'deleted') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT NOW()
);
\`\`\`

## Default Keywords
- "spam keyword 1"
- "spam keyword 2"
- ... (configurable in DB)

## Testing
\`\`\`bash
# Post with keyword
curl -X POST http://localhost:4000/posts \
  -d '{"content":"spam keyword 1 here"}' \
  -H 'Authorization: Bearer TOKEN'
# Check: POST should be flagged/hidden
# Admin retrieves queue: GET /admin/moderation-queue
\`\`\`

## Related
- Admin dashboard (Issue #XXX)
- User disable endpoint (Issue #XXX)
```

### Issue 14: Admin Dashboard (Skeleton - React)
```
Title: feat(frontend): build admin dashboard for user search + moderation queue

Labels: epic:admin, priority:high, size:m, week:3

Assignee: @frontend-engineer

## Description

Build admin panel with user search and moderation queue.

## Tasks

- [ ] Create web/src/pages/Admin.tsx
- [ ] Add route: /admin (ProtectedRoute + admin role check)
- [ ] UserSearch component: search by email, list results
  - Action buttons: disable user, view profile, send message
- [ ] ModerationQueue component: list flagged posts
  - Action buttons: approve, delete, contact author
- [ ] AdminStats component: total users, flagged posts, pending reports
- [ ] API integration: GET /admin/users?search, GET /admin/moderation-queue
- [ ] Mobile responsive
- [ ] Tailwind dark mode

## Acceptance Criteria

- [ ] Admin page accessible (hardcoded admin for now)
- [ ] User search works (API call)
- [ ] Moderation queue displays
- [ ] Action buttons functional (API calls)
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Admin role required (403 if not admin)

## Estimate
6 hours

## API Endpoints
- GET /admin/users?search=email → [{ id, email, createdAt, disabled }]
- POST /admin/users/:id/disable → { message: "User disabled" }
- POST /admin/users/:id/enable → { message: "User enabled" }
- GET /admin/moderation-queue → [{ id, postId, reason, status, createdAt }]
- POST /admin/moderation/:id/approve → { message: "Approved" }
- POST /admin/moderation/:id/delete → { message: "Deleted" }

## File Structure
\`\`\`
web/src/pages/Admin.tsx
web/src/components/admin/UserSearch.tsx
web/src/components/admin/ModerationQueue.tsx
web/src/components/admin/AdminStats.tsx
web/e2e/admin.spec.ts
\`\`\`

## Testing
\`\`\`bash
# Login as admin
# Navigate to /admin
# Search for user
# Approve/delete moderation item
\`\`\`

## Design Reference
See Figma: [link] Admin dashboard
```

### Issue 15: Rate Limiting (Auth Endpoints)
```
Title: feat(security): add Redis-backed rate limiting for auth endpoints

Labels: epic:security, priority:high, size:s, week:3

Assignee: @backend-engineer

## Description

Implement rate limiting on authentication endpoints using Redis token buckets.

## Tasks

- [ ] Create RateLimitGuard middleware
- [ ] Apply to: POST /auth/login, /auth/signup, /auth/request-password-reset
- [ ] Limits:
  - Login: 10 attempts / 15min per IP
  - Signup: 3 accounts / hour per IP
  - Password reset: 5 / hour per IP
- [ ] Response: 429 Too Many Requests with Retry-After header
- [ ] Redis key: ratelimit:{endpoint}:{ip}:{timestamp}
- [ ] Whitelist localhost for testing
- [ ] E2E test: exceed limit, verify 429

## Acceptance Criteria

- [ ] Rate limit enforced on auth endpoints
- [ ] Exceeding limit returns 429
- [ ] Retry-After header present
- [ ] Redis key expires correctly
- [ ] Localhost whitelisted
- [ ] Logging for blocked requests
- [ ] E2E test passes

## Estimate
3 hours

## Implementation (Pseudocode)
\`\`\`typescript
@UseGuards(RateLimitGuard)
@Post('login')
async login(@Body() dto: LoginDto) {
  // ...
}

// RateLimitGuard checks:
// const key = `ratelimit:login:${ip}`;
// if (redis.get(key) > 10) return 429;
// redis.incr(key);
// redis.expire(key, 15 * 60);
\`\`\`

## Testing
\`\`\`bash
# Call login endpoint 11 times rapidly from same IP
# Should get 429 on 11th attempt
# Verify Retry-After header
\`\`\`

## Related
- Security headers (Issue #XXX)
- CORS hardening (Issue #XXX)
```

---

## WEEK 4: DEPLOYMENT & INFRASTRUCTURE

### Issue 16: Multi-Stage Docker Builds
```
Title: build(docker): create production Dockerfiles for backend and frontend

Labels: epic:deployment, priority:critical, size:s, week:4

Assignee: @devops-engineer

## Description

Create optimized, multi-stage Docker builds for production deployment.

## Tasks

- [ ] Create packages/backend/Dockerfile (node build → distroless runtime)
- [ ] Create web/Dockerfile (node build → nginx runtime)
- [ ] Set image size targets: backend <300MB, frontend <100MB
- [ ] Add .dockerignore files (exclude node_modules, test, docs)
- [ ] Health checks in Dockerfile
- [ ] Non-root user for security
- [ ] Test images build locally
- [ ] Push to registry (ECR/GCR) in CI

## Acceptance Criteria

- [ ] Both images build without error
- [ ] Image sizes under targets
- [ ] Containers start cleanly
- [ ] Health checks pass
- [ ] No root user
- [ ] All dependencies included

## Estimate
4 hours

## Backend Dockerfile Structure
\`\`\`dockerfile
FROM node:20 AS builder
WORKDIR /app
COPY pnpm-lock.yaml .
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM gcr.io/distroless/nodejs20-debian11
COPY --from=builder /app/dist /app
CMD ["index.js"]
\`\`\`

## Frontend Dockerfile Structure
\`\`\`dockerfile
FROM node:20 AS builder
WORKDIR /app
COPY pnpm-lock.yaml .
RUN pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
\`\`\`

## Testing
\`\`\`bash
docker build -t daira-backend:latest packages/backend
docker run daira-backend:latest
# Verify health endpoint returns 200
\`\`\`
```

### Issue 17: Kubernetes Manifests (Staging)
```
Title: infra(k8s): create Kubernetes manifests for staging deployment

Labels: epic:deployment, priority:critical, size:m, week:4

Assignee: @devops-engineer

## Description

Create Kubernetes manifests for staging environment.

## Tasks

- [ ] Create k8s/staging/ directory structure
- [ ] deployment-backend.yaml: 2 replicas, health checks, resource limits
- [ ] deployment-frontend.yaml: 2 replicas, resource limits
- [ ] service-backend.yaml: ClusterIP, port 4000
- [ ] service-frontend.yaml: ClusterIP, port 80
- [ ] configmap.yaml: environment variables
- [ ] secret.yaml: DATABASE_URL, JWT_SECRET, etc.
- [ ] ingress.yaml: domain routing, TLS
- [ ] Validate manifests with kubectl apply --dry-run
- [ ] Documentation: how to deploy

## Acceptance Criteria

- [ ] Manifests validate with kubectl --dry-run
- [ ] All required fields present
- [ ] Health probes configured (liveness + readiness)
- [ ] Resource requests/limits set
- [ ] No hardcoded secrets in manifests
- [ ] Replicas configured for HA
- [ ] Ingress routing correct

## Estimate
6 hours

## File Structure
\`\`\`
k8s/staging/
├── deployment-backend.yaml
├── deployment-frontend.yaml
├── service-backend.yaml
├── service-frontend.yaml
├── configmap.yaml
├── secret.yaml
├── ingress.yaml
└── README.md
\`\`\`

## Validation
\`\`\`bash
kubectl apply -f k8s/staging --dry-run=client --validate=true
\`\`\`

## Related
- Docker builds (Issue #XXX)
- Terraform skeleton (Issue #XXX)
```

### Issue 18: GitHub Actions for Staging Deploy
```
Title: ci(cd): add GitHub Actions workflow to deploy to staging K8s

Labels: epic:deployment, priority:critical, size:m, week:4

Assignee: @devops-engineer

## Description

Create GitHub Actions workflow for automated staging deployments.

## Tasks

- [ ] Create .github/workflows/deploy-staging.yml
- [ ] Trigger: push to develop branch
- [ ] Build Docker images (backend + frontend)
- [ ] Push images to registry (ECR/GCR)
- [ ] Update K8s manifests with new image tags
- [ ] Deploy to staging namespace with kubectl apply
- [ ] Run health checks (curl /health)
- [ ] Run Playwright smoke tests
- [ ] Rollback on failure
- [ ] Post deployment status to PR

## Acceptance Criteria

- [ ] Workflow file exists and validates
- [ ] Images build and push to registry
- [ ] Kubernetes manifests updated
- [ ] Deployment successful
- [ ] Smoke tests pass
- [ ] Rollback tested
- [ ] Status message in PR

## Estimate
5 hours

## Workflow Steps (Pseudocode)
\`\`\`yaml
- name: Build Docker Images
  run: |
    docker build -t backend:${{ github.sha }} packages/backend
    docker build -t frontend:${{ github.sha }} web

- name: Push to Registry
  run: |
    docker tag backend:${{ github.sha }} gcr.io/project/backend:${{ github.sha }}
    docker push gcr.io/project/backend:${{ github.sha }}

- name: Deploy to Staging
  run: |
    kubectl set image deployment/backend-staging \
      backend=gcr.io/project/backend:${{ github.sha }} \
      -n staging

- name: Run Smoke Tests
  run: |
    pnpm -C web test:e2e
\`\`\`

## Testing
- Push to develop branch
- Watch GitHub Actions run
- Verify staging deployment succeeds
- Check Smoke tests pass
```

---

## 📋 HOW TO USE THESE TEMPLATES

1. **Copy entire issue block** (from Title to Related)
2. **Paste into GitHub Issues "New Issue"**
3. **Update fields:**
   - Assignee: @actual-username
   - Labels: add any missing
   - Estimate: adjust if needed
4. **Create issue**
5. **Add to GitHub Project board** (epic column)

---

## 🔗 LINKING ISSUES

Add to each issue's "Related" section:
\`\`\`
## Related
- Depends on: #XXX
- Blocked by: #YYY
- Related to: #ZZZ
\`\`\`

---

## ✅ COMPLETION CHECKLIST

- [ ] All 40+ issues created in GitHub
- [ ] Assigned to team members
- [ ] Added to GitHub Project board
- [ ] Estimated story points
- [ ] Dependencies marked
- [ ] Ready for Week 1 kickoff

---

**Next Step:** Copy these into GitHub Issues now! 🚀
