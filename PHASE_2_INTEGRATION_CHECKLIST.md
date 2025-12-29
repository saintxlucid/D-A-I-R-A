# Phase 2: Skeletal System - Integration Checklist

**Status**: ✅ ALL FILES CREATED & DOCUMENTED

---

## Pre-Integration Verification

Before integrating Phase 2 into your application, verify all files exist:

```bash
# Verify all database service files exist
ls -la packages/backend/src/lib/database/

# Should show:
# ✓ APP_MODULE.guide.ts
# ✓ database-initialization.service.ts
# ✓ database-pool.service.ts
# ✓ database.module.ts
# ✓ index.ts
# ✓ migrations.ts
# ✓ prisma.service.ts
# ✓ query-optimization.service.ts
# ✓ schema-validation.dto.ts

# Verify Prisma schema
ls -la packages/backend/prisma/schema.prisma

# Verify documentation
ls -la docs/PHASE_2_SKELETAL_SYSTEM.md
```

---

## Integration Steps (In Order)

### Step 1: Install Dependencies ✓ Todo

```bash
# Install Prisma and database client
npm install @prisma/client
npm install -D prisma

# Install class-validator for DTOs
npm install class-validator class-transformer

# Verify installations
npm list @prisma/client prisma class-validator
```

**Status**: [ ] Complete

---

### Step 2: Generate Prisma Client ✓ Todo

```bash
# Generate Prisma client from schema
npx prisma generate

# Verify generation
ls node_modules/.prisma/client/

# Should show: index.d.ts, index.js
```

**Status**: [ ] Complete

---

### Step 3: Update app.module.ts ✓ Todo

Add DatabaseModule import to your main application module:

```typescript
// app.module.ts

import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

// ← ADD THESE IMPORTS
import { DatabaseModule } from './lib/database/database.module';
import { DatabaseInitializationService } from './lib/database/database-initialization.service';

// Import CirculatoryModule from Phase 1
import { CirculatoryModule } from './common/circulatory/circulatory.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV}`,
        '.env',
      ],
    }),

    // ← ADD THIS LINE
    DatabaseModule,

    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

    // Phase 1: Circulatory System
    CirculatoryModule,

    // Add other modules here...
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private dbInit: DatabaseInitializationService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing application...');

    // Initialize database (migrations, seeding, health check)
    await this.dbInit.initializeDatabase();

    this.logger.log('✅ Application initialized successfully');
  }

  private readonly logger = new Logger(AppModule.name);
}
```

**Status**: [ ] Complete

**Verification**:
- [ ] app.module.ts file saved
- [ ] No TypeScript errors
- [ ] DatabaseModule is imported
- [ ] DatabaseInitializationService is injected
- [ ] onModuleInit calls dbInit.initializeDatabase()

---

### Step 4: Configure Environment Variables ✓ Todo

Create or update `.env` and `.env.development` files:

```env
# .env (or .env.development for dev)

# Database Configuration
DATABASE_URL="postgresql://daira_user:daira_password@localhost:5432/daira_db"
DATABASE_POOL_MIN=10
DATABASE_POOL_MAX=50
DATABASE_POOL_IDLE_TIMEOUT=30000
DATABASE_POOL_CONNECTION_TIMEOUT=5000

# Redis Configuration (for caching & events)
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""
REDIS_DB=0

# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Authentication (from Phase 1)
JWT_SECRET="your_jwt_secret_key_here"
JWT_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d

# File Storage (AWS/Cloudflare)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=daira-content
AWS_CLOUDFRONT_URL=https://cdn.daira.io

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@daira.io
SMTP_PASSWORD=your_password

# Payments
STRIPE_SECRET_KEY=sk_test_xxx
FAWRY_API_KEY=xxx
FAWRY_MERCHANT_CODE=xxx
```

**Status**: [ ] Complete

**Verification**:
- [ ] `.env` file created with DATABASE_URL
- [ ] REDIS_URL configured
- [ ] All required variables present
- [ ] No secrets committed to git (add .env to .gitignore)

---

### Step 5: Create Database Migrations ✓ Todo

```bash
# Create initial migration from schema
npx prisma migrate dev --name init

# This will:
# 1. Generate Prisma client
# 2. Create migration files
# 3. Apply migrations to database
# 4. Seed initial data (if configured)

# Verify migration
npx prisma migrate status

# View database in Prisma Studio
npx prisma studio
```

**Status**: [ ] Complete

**Verification**:
- [ ] Migration files created in `prisma/migrations/`
- [ ] Migration applied successfully
- [ ] Prisma Studio shows all 50+ tables
- [ ] No migration errors in console

---

### Step 6: Verify Database Connection ✓ Todo

```bash
# Start application
npm run start

# Monitor console for startup messages:
# ✓ "Initializing Prisma connection..."
# ✓ "Prisma connected successfully"
# ✓ "Running database migrations..."
# ✓ "Database initialization completed successfully"
# ✓ "Application initialized successfully"
```

**Status**: [ ] Complete

**Verification**:
- [ ] Application starts without errors
- [ ] All initialization logs appear
- [ ] No connection errors
- [ ] Health check endpoint responds

---

### Step 7: Test Health Check Endpoints ✓ Todo

```bash
# Check database health
curl http://localhost:3000/health/db
# Expected response:
# {
#   "status": "healthy",
#   "database": "PostgreSQL (12ms)",
#   "timestamp": "2024-01-15T10:30:00Z"
# }

# Check database statistics
curl http://localhost:3000/health/stats
# Expected response:
# {
#   "users": 2,
#   "posts": 0,
#   "videos": 0,
#   "follows": 0,
#   "transactions": 0,
#   "timestamp": "2024-01-15T10:30:00Z"
# }
```

**Status**: [ ] Complete

**Verification**:
- [ ] `/health/db` returns "healthy"
- [ ] Database latency shown
- [ ] `/health/stats` shows user count > 0 (from seed)
- [ ] No connection errors

---

### Step 8: Verify Caching Layer ✓ Todo

```bash
# Connect to Redis and verify
redis-cli
> PING
# Should return: PONG

> KEYS *
# Should show cache keys (after operations)

# Check cache metrics
curl http://localhost:3000/metrics/cache
```

**Status**: [ ] Complete

**Verification**:
- [ ] Redis connection successful (PING returns PONG)
- [ ] Cache keys created after operations
- [ ] Cache hit/miss metrics tracked

---

### Step 9: Test Query Optimization ✓ Todo

Create a simple test service to verify N+1 prevention:

```typescript
// test-queries.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from './lib/database/prisma.service';
import { QueryOptimizationService } from './lib/database/query-optimization.service';

@Injectable()
export class TestQueriesService {
  constructor(
    private prisma: PrismaService,
    private query: QueryOptimizationService,
  ) {}

  async testBatchLoad() {
    // Create test users
    const user1 = await this.prisma.user.create({
      data: { email: 'test1@daira.io', username: 'testuser1' },
    });
    const user2 = await this.prisma.user.create({
      data: { email: 'test2@daira.io', username: 'testuser2' },
    });

    // Test batch loading (should be 1 query, not 2)
    const users = await this.prisma.getMultipleUsers([user1.id, user2.id]);
    
    console.log(`✓ Batch loaded ${users.length} users in 1 query`);
    return users;
  }

  async testCaching() {
    const user = await this.prisma.user.findFirst();
    
    // Get metrics before
    const before = this.prisma.getMetrics();
    
    // Execute same query twice
    await this.prisma.user.findUnique({ where: { id: user.id } });
    await this.prisma.user.findUnique({ where: { id: user.id } });
    
    const after = this.prisma.getMetrics();
    
    console.log(`✓ Query executed 2 times, metrics: ${JSON.stringify(after)}`);
    return after;
  }
}
```

**Status**: [ ] Complete

**Verification**:
- [ ] Batch loading test passes (1 query for 2 users)
- [ ] Query metrics show improvement
- [ ] No N+1 query warnings

---

### Step 10: Performance Baseline ✓ Todo

Establish performance baselines for monitoring:

```bash
# Record query metrics
npm run test:performance

# Expected output:
# Single user lookup: <5ms
# Batch load 100 users: <80ms
# User feed (20 posts): <50ms
# Popular posts (20): <150ms
```

**Status**: [ ] Complete

**Verification**:
- [ ] Performance tests complete
- [ ] Metrics within expected ranges
- [ ] Baselines recorded for monitoring

---

## Rollback Checklist

If you need to revert Phase 2 at any point:

```bash
# 1. Revert Phase 2 files
git reset --hard 389d1c3  # Goes back to Phase 1 complete

# 2. Remove Phase 2 packages
npm uninstall @prisma/client
npm uninstall -D prisma
npm uninstall class-validator

# 3. Verify Phase 1 still works
npm run test
npm run start

# 4. Check git status
git status
```

**Rollback Status**: [ ] Verified

---

## Post-Integration Verification

After all integration steps, verify the system is fully operational:

**Database Layer**:
- [ ] Prisma client generated successfully
- [ ] Migrations applied to database
- [ ] All 50+ tables created
- [ ] Indexes created
- [ ] Seed data loaded (admin + test user)

**Application Layer**:
- [ ] app.module.ts updated with DatabaseModule
- [ ] DatabaseInitializationService injected
- [ ] onModuleInit fires on app startup
- [ ] No TypeScript errors
- [ ] No runtime errors

**API Layer**:
- [ ] Health check endpoint works
- [ ] Statistics endpoint shows data
- [ ] Cache operations functional
- [ ] Query optimization working

**Monitoring**:
- [ ] Metrics collection enabled
- [ ] Database metrics tracked
- [ ] Cache metrics tracked
- [ ] Performance baselines recorded

---

## Success Criteria

Phase 2 is successfully integrated when:

✅ Application starts without errors
✅ All database tables created (50+)
✅ Health check endpoint responds with "healthy"
✅ Admin + test user seeded
✅ Redis cache operational
✅ Query metrics tracked
✅ No N+1 query warnings
✅ Performance within expected ranges
✅ Ready for Phase 3: Nervous System

---

## Common Issues & Solutions

### Issue 1: "Cannot find module @prisma/client"
**Solution**:
```bash
npm install @prisma/client
npx prisma generate
npm run build
```

### Issue 2: "Database connection refused"
**Solution**:
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Or start with docker-compose
docker-compose up -d postgres

# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Issue 3: "Prisma schema validation failed"
**Solution**:
```bash
# Validate schema
npx prisma validate

# Regenerate client
npx prisma generate

# Check for syntax errors in schema.prisma
```

### Issue 4: "Migration already executed"
**Solution**:
```bash
# Check migration status
npx prisma migrate status

# Reset and re-apply (DEV ONLY)
npx prisma migrate reset
```

---

## Documentation Reference

- **Prisma Docs**: https://www.prisma.io/docs/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Redis Docs**: https://redis.io/docs/
- **NestJS Database**: https://docs.nestjs.com/techniques/database

---

## Integration Timeline

| Step | Estimated Time | Status |
|------|---|---|
| 1. Install dependencies | 2 min | [ ] |
| 2. Generate Prisma client | 1 min | [ ] |
| 3. Update app.module.ts | 5 min | [ ] |
| 4. Configure environment | 3 min | [ ] |
| 5. Create migrations | 2 min | [ ] |
| 6. Start application | 3 min | [ ] |
| 7. Test health check | 2 min | [ ] |
| 8. Verify caching | 2 min | [ ] |
| 9. Test optimization | 5 min | [ ] |
| 10. Performance baseline | 5 min | [ ] |
| **Total** | **~30 min** | [ ] |

---

## Next Phase: Phase 3 - Nervous System

After Phase 2 integration is complete and verified, you're ready for:

**Phase 3: Nervous System** - API Layer
- REST API controllers
- GraphQL schema
- WebSocket layer (Socket.IO)
- Rate limiting
- Error handling
- Request validation

**Estimated duration**: 3-5 days

---

**Created**: Phase 2 - Skeletal System
**Status**: ✅ READY FOR INTEGRATION
**Last Updated**: 2024-01-15
