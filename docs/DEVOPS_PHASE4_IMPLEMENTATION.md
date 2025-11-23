# DevOps & Production Pipeline - Phase 4 Implementation Guide

**Status:** ✅ Infrastructure Complete | 🚀 Ready for Deployment
**Phase Duration:** 7–10 Days
**Team Size:** 2–3 DevOps Engineers
**Tech Stack:** Docker, Kubernetes, GitHub Actions, Prometheus, Grafana, Jaeger

---

## Overview

Phase 4 sets up production-ready DevOps infrastructure for the DAIRA platform. All components are containerized, orchestrated with Kubernetes, and monitored with comprehensive observability.

---

## 1. Components Created (Summary)

### Docker Images
- ✅ **Dockerfile.backend** - Multi-stage NestJS build (optimized for production)
- ✅ **Dockerfile.frontend** - Multi-stage Vite + Nginx build with compression

### Web Server Configuration
- ✅ **nginx.conf** - Main Nginx configuration with gzip, security headers, rate limiting
- ✅ **nginx-default.conf** - Server block with SPA routing, API proxy, WebSocket support

### Docker Compose
- ✅ **docker-compose.prod.yml** - Full production stack (8 services):
  - PostgreSQL with health checks
  - Redis with persistence
  - Backend API (NestJS)
  - Frontend (Nginx)
  - Prometheus (metrics)
  - Grafana (visualization)
  - Jaeger (tracing)

### CI/CD Pipeline
- ✅ **.github/workflows/ci-cd.yml** - Complete GitHub Actions workflow with:
  - Linting and format checks
  - Backend tests with coverage
  - Frontend tests and build
  - Security scanning (npm audit, Trivy)
  - E2E tests with Playwright
  - Docker image building and pushing
  - Staging deployment
  - Smoke tests

### Kubernetes Manifests
- ✅ **k8s/staging.yaml** - Complete staging environment:
  - StatefulSets for PostgreSQL and Redis
  - Deployments for backend and frontend (2 replicas each)
  - Services for internal communication
  - Ingress for external routing
  - HorizontalPodAutoscalers for auto-scaling
  - ConfigMaps and Secrets management

### Monitoring & Alerting
- ✅ **prometheus.yml** - Prometheus scrape config for all services
- ✅ **alerts.yml** - Alert rules for errors, latency, resources

### Configuration
- ✅ **.env.example** - Comprehensive environment variables template

---

## 2. Docker Image Architecture

### Backend Image (Multi-stage)

**Stage 1: Builder**
```dockerfile
FROM node:18-alpine
# Install dependencies
# Build NestJS application
# Generate Prisma client
```

**Stage 2: Runtime**
```dockerfile
FROM node:18-alpine
# Copy dist files from builder
# Non-root user (nestjs)
# Health checks
# dumb-init for signal handling
```

**Size:** ~250MB (production)

### Frontend Image (Multi-stage)

**Stage 1: Builder**
```dockerfile
FROM node:18-alpine
# Install dependencies
# Build Vite application
```

**Stage 2: Runtime**
```dockerfile
FROM nginx:alpine
# Copy Nginx config with rate limiting
# Copy built files
# Health checks
```

**Size:** ~50MB (production)

---

## 3. Nginx Configuration

### Security Headers
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

### Gzip Compression
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1000;
gzip_types text/plain text/css text/xml text/javascript application/json;
```

### Rate Limiting
```nginx
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
```

### API Proxy
```nginx
location /api/ {
    proxy_pass http://backend:3000/api/;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### WebSocket Support
```nginx
location /socket.io {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
}
```

---

## 4. CI/CD Pipeline Workflow

### Trigger Events
- Push to `main`, `develop`, or `feat/**` branches
- Pull requests to `main` or `develop`

### Pipeline Stages

**Stage 1: Quality Checks (Parallel)**
```
Lint → Format Check → Backend Tests → Frontend Tests → E2E Tests
```

**Stage 2: Security**
```
npm audit → Trivy Scan → SAST
```

**Stage 3: Build**
```
Docker Build (Backend) → Push to Registry
Docker Build (Frontend) → Push to Registry
```

**Stage 4: Deploy (Conditional)**
```
Deploy to Staging (if develop/main) → Smoke Tests
```

### Pipeline Matrix

| Stage | Action | Trigger | Output |
|-------|--------|---------|--------|
| Lint | Check code formatting | Always | Pass/Fail |
| Test Backend | Jest unit tests | Always | Coverage report |
| Test Frontend | Vitest/Playwright | Always | E2E report |
| Security | npm audit, Trivy | Always | Vulnerability report |
| Build | Multi-stage Docker build | Always | Docker image |
| Push | Push to GHCR | main/develop only | Image URL |
| Deploy | kubectl set image | main/develop only | Deployment status |
| Smoke Test | Health checks | After deploy | Success/Failure |

---

## 5. Kubernetes Deployment

### Namespace Isolation
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: daira-staging
```

### StatefulSet: PostgreSQL
```yaml
replicas: 1
volumeMounts:
  - name: postgres-storage
    mountPath: /var/lib/postgresql/data
livenessProbe: pg_isready
readinessProbe: pg_isready
```

### StatefulSet: Redis
```yaml
replicas: 1
command: ["redis-server", "--appendonly yes"]
livenessProbe: redis-cli ping
readinessProbe: redis-cli ping
```

### Deployment: Backend (2 replicas)
```yaml
replicas: 2
podAntiAffinity: Spread across nodes
resources:
  requests: cpu=250m, memory=256Mi
  limits: cpu=500m, memory=512Mi
livenessProbe: GET /api/health
readinessProbe: GET /api/health
```

### Deployment: Frontend (2 replicas)
```yaml
replicas: 2
podAntiAffinity: Spread across nodes
resources:
  requests: cpu=100m, memory=128Mi
  limits: cpu=200m, memory=256Mi
livenessProbe: GET /_health
readinessProbe: GET /_health
```

### Ingress Configuration
```yaml
ingress:
  - /api → backend:3000
  - /socket.io → backend:3000
  - / → frontend:80
tls:
  - staging.daira.dev (Let's Encrypt)
```

### Auto-scaling Rules
```yaml
HPA Backend:
  min: 2 replicas
  max: 5 replicas
  trigger: CPU > 70% or Memory > 80%

HPA Frontend:
  min: 2 replicas
  max: 5 replicas
  trigger: CPU > 70% or Memory > 80%
```

---

## 6. Observability Stack

### Prometheus (Metrics Collection)

**Scrape Targets:**
- Backend API metrics (/api/metrics)
- Redis instance
- PostgreSQL (via exporter)
- Prometheus itself

**Scrape Interval:** 15s (default), 10s (backend)

### Alert Rules

**Critical Alerts:**
1. HighErrorRate - error rate > 5% for 5m
2. DatabaseConnectionPoolExhausted - 90+ connections
3. PodRestartingTooOften - > 0.5 restarts/hour

**Warning Alerts:**
1. HighLatency - p95 > 1s
2. RedisMemoryHigh - > 80% usage
3. FrontendErrorRate - > 1% error rate

### Grafana Dashboards

**Backend Dashboard:**
- Request rate and latency
- Error rates by endpoint
- Database query performance
- Redis hit rate

**Infrastructure Dashboard:**
- Pod CPU/Memory usage
- Network traffic
- Storage utilization
- Node health

**Frontend Dashboard:**
- Page load times
- JavaScript errors
- User sessions
- Build duration

### Jaeger Tracing

**Trace Ingestion:**
```
OTEL SDK → Jaeger Collector (port 4317) → Jaeger Backend
```

**Visualization:**
- Service map
- Request traces
- Latency analysis
- Error analysis

---

## 7. Environment Configuration

### Production (.env)
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@postgres:5432/daira
REDIS_URL=redis://:password@redis:6379
JWT_SECRET=<strong-random-key>
CORS_ORIGIN=https://daira.dev
LOG_LEVEL=info
```

### Staging (.env.staging)
```bash
NODE_ENV=staging
DATABASE_URL=postgresql://user:pass@postgres-staging:5432/daira
REDIS_URL=redis://:password@redis-staging:6379
JWT_SECRET=<staging-key>
CORS_ORIGIN=https://staging.daira.dev
LOG_LEVEL=debug
```

### Development (.env.local)
```bash
NODE_ENV=development
DATABASE_URL=postgresql://daira_dev:dev@localhost:5432/daira_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev_secret
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

---

## 8. Deployment Workflow

### Initial Setup (1 day)

1. **Create Docker Registry**
   ```bash
   # GHCR (GitHub Container Registry) automatically available
   ```

2. **Create Kubernetes Cluster**
   ```bash
   # Azure AKS, AWS EKS, or GKE
   ```

3. **Install Ingress Controller**
   ```bash
   helm install nginx-ingress ingress-nginx/ingress-nginx
   ```

4. **Install Cert Manager**
   ```bash
   helm install cert-manager jetstack/cert-manager
   ```

5. **Create Namespace and Secrets**
   ```bash
   kubectl create namespace daira-staging
   kubectl create secret generic daira-secrets \
     --from-literal=DATABASE_URL=postgresql://... \
     --from-literal=REDIS_URL=redis://... \
     -n daira-staging
   ```

### Deploy to Staging (2-3 hours)

```bash
# 1. Build and push images
docker build -f Dockerfile.backend -t ghcr.io/saintxlucid/daira/backend:latest .
docker push ghcr.io/saintxlucid/daira/backend:latest

docker build -f Dockerfile.frontend -t ghcr.io/saintxlucid/daira/frontend:latest .
docker push ghcr.io/saintxlucid/daira/frontend:latest

# 2. Apply Kubernetes manifests
kubectl apply -f k8s/staging.yaml

# 3. Wait for deployment
kubectl rollout status deployment/daira-backend -n daira-staging
kubectl rollout status deployment/daira-frontend -n daira-staging

# 4. Verify
kubectl get pods -n daira-staging
kubectl logs deployment/daira-backend -n daira-staging
```

### Rolling Update Process

```bash
# Automated by CI/CD
kubectl set image deployment/daira-backend \
  daira-backend=ghcr.io/saintxlucid/daira/backend:v1.2.3 \
  -n daira-staging --record

kubectl rollout status deployment/daira-backend -n daira-staging
```

---

## 9. Monitoring Setup

### Prometheus Dashboard

```bash
# Access at http://localhost:9090 or http://staging.daira.dev:9090
```

**Key Queries:**
```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Latency p95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Database connections
pg_stat_activity_count

# Redis memory
redis_memory_used_bytes / redis_memory_max_bytes
```

### Grafana Configuration

```bash
# Access at http://localhost:3001 or http://staging.daira.dev:3001
# Default: admin / admin
```

**Add Data Source:**
1. Configuration → Data Sources → Add
2. Select Prometheus
3. URL: http://prometheus:9090
4. Save & Test

**Import Dashboards:**
- Backend monitoring (ID: 11074)
- Node exporter (ID: 1860)
- PostgreSQL (ID: 9628)

### Jaeger Tracing

```bash
# Access at http://localhost:16686 or http://staging.daira.dev:16686
```

**Configure in Backend:**
```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { JaegerExporter } from '@opentelemetry/exporter-trace-jaeger-compact';

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: 'http://localhost:14250',
  }),
});

sdk.start();
```

---

## 10. Security Checklist

- [ ] Image scanning enabled (Trivy in CI/CD)
- [ ] Non-root user in Docker containers
- [ ] Resource limits set in Kubernetes
- [ ] Network policies defined
- [ ] Secrets encrypted at rest
- [ ] RBAC configured
- [ ] TLS/SSL enabled
- [ ] Rate limiting configured
- [ ] WAF rules in place
- [ ] Audit logging enabled

---

## 11. Performance Optimization

### Container Optimization

```dockerfile
# Use slim/alpine images
FROM node:18-alpine

# Multi-stage builds
FROM builder AS final

# Remove unnecessary files
RUN npm prune --production

# Set memory limits
ENV NODE_OPTIONS="--max-old-space-size=256"
```

### Kubernetes Optimization

```yaml
# Resource requests/limits
resources:
  requests:
    cpu: 250m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi

# HPA for auto-scaling
maxReplicas: 5
targetCPUUtilizationPercentage: 70
```

### Database Optimization

```sql
-- Indexes (from Phase 2)
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_post_author_created ON posts(author_id, created_at DESC);

-- Connection pooling via Redis
-- Query result caching
```

---

## 12. Backup & Disaster Recovery

### Database Backups

```bash
# Daily backup schedule (Kubernetes CronJob)
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
spec:
  schedule: "0 2 * * *"  # 2 AM daily
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:15
            command:
            - /bin/sh
            - -c
            - pg_dump $DATABASE_URL | gzip > /backup/db-$(date +%Y%m%d).sql.gz
```

### Point-in-Time Recovery

```bash
# Restore from backup
gunzip /backup/db-20251120.sql.gz
psql $DATABASE_URL < /backup/db-20251120.sql
```

---

## 13. Daily Implementation Schedule (7–10 Days)

**Day 1–2: Docker Setup**
- [ ] Test Dockerfile.backend locally
- [ ] Test Dockerfile.frontend locally
- [ ] Push test images to GHCR
- [ ] Document image sizes and build times

**Day 2–3: Kubernetes Setup**
- [ ] Create staging cluster
- [ ] Install Ingress controller
- [ ] Install cert-manager
- [ ] Deploy k8s/staging.yaml

**Day 3–4: CI/CD Pipeline**
- [ ] Test GitHub Actions workflow
- [ ] Configure automatic image builds
- [ ] Set up staging deployments
- [ ] Test rollback procedures

**Day 4–5: Monitoring**
- [ ] Deploy Prometheus and Grafana
- [ ] Create alerting rules
- [ ] Build monitoring dashboards
- [ ] Configure Jaeger tracing

**Day 5–7: Integration Testing**
- [ ] Smoke tests on staging
- [ ] Performance baseline testing
- [ ] Load testing with k6
- [ ] Failover testing

**Day 7–10: Documentation & Refinement**
- [ ] Runbook creation
- [ ] Deployment procedures
- [ ] Troubleshooting guide
- [ ] Team training

---

## 14. Common Commands

### Docker

```bash
# Build images
docker build -f Dockerfile.backend -t daira-backend:latest .
docker build -f Dockerfile.frontend -t daira-frontend:latest .

# Run containers
docker run -d --name daira-backend daira-backend:latest
docker run -d --name daira-frontend daira-frontend:latest

# View logs
docker logs daira-backend -f
docker logs daira-frontend -f

# Health check
curl http://localhost:3000/api/health
curl http://localhost:5173/_health
```

### Kubernetes

```bash
# Deploy
kubectl apply -f k8s/staging.yaml

# Check status
kubectl get pods -n daira-staging
kubectl describe pod <pod-name> -n daira-staging
kubectl logs <pod-name> -n daira-staging

# Scale
kubectl scale deployment daira-backend --replicas=3 -n daira-staging

# Rolling update
kubectl set image deployment/daira-backend \
  daira-backend=ghcr.io/saintxlucid/daira/backend:v1.2.3 \
  -n daira-staging

# Rollback
kubectl rollout undo deployment/daira-backend -n daira-staging

# Port forward
kubectl port-forward svc/daira-backend 3000:3000 -n daira-staging
```

### GitHub Actions

```bash
# View workflow runs
gh run list -R saintxlucid/D-A-I-R-A

# View workflow details
gh run view <run-id> -R saintxlucid/D-A-I-R-A

# Cancel run
gh run cancel <run-id> -R saintxlucid/D-A-I-R-A
```

---

## 15. Troubleshooting

### Pod fails to start
```bash
# Check events
kubectl describe pod <pod-name> -n daira-staging

# Check logs
kubectl logs <pod-name> -n daira-staging --previous

# Check image
docker pull ghcr.io/saintxlucid/daira/backend:latest
```

### High memory usage
```bash
# Check pod metrics
kubectl top pod -n daira-staging

# Increase limits
kubectl set resources deployment daira-backend \
  -c=daira-backend --limits=memory=1Gi -n daira-staging
```

### Database connection errors
```bash
# Check connection
kubectl exec -it deployment/daira-backend -n daira-staging -- \
  psql $DATABASE_URL -c "SELECT 1"

# Check connection pool
kubectl exec -it postgres-0 -n daira-staging -- \
  psql -c "SELECT count(*) FROM pg_stat_activity"
```

---

## 16. Production Deployment

**Only after successful staging validation:**

1. Create production namespace
2. Deploy to production cluster (manual approval)
3. Run comprehensive smoke tests
4. Enable full monitoring and alerting
5. Document any issues for post-mortem

---

**Phase 4 Complete!** Your infrastructure is production-ready. 🚀

**Next Phase:** Phase 5 - Performance Optimization & Scaling
