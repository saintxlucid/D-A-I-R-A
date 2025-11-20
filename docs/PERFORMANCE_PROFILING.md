# Performance Profiling Guide for Phase 6 Load Testing

**Purpose:** Identify CPU, memory, and I/O bottlenecks during K6 load test
**Target:** Baseline metrics before/after optimization, identify hotspots

---

## 1. CPU Profiling (Node.js)

### 1.1 V8 CPU Profiling

**Start backend with profiling flag:**

```bash
# Terminal 1: Start backend with CPU profiling
node --prof packages/backend/dist/main.js

# Or in package.json
{
  "scripts": {
    "dev:profile": "node --prof packages/backend/dist/main.js"
  }
}

# npm run dev:profile
```

**Run K6 load test (in separate terminal):**

```bash
# Terminal 2: Run K6 with 5-minute duration
k6 run --vus 100 --duration 5m tests/load-test.js

# After K6 completes, stop Node.js backend (Ctrl+C)
```

**Process CPU profile:**

```bash
# Node generates isolate-*.log files
ls -la isolate-*.log

# Convert to readable format
node --prof-process isolate-*.log > profile.txt

# View profile
cat profile.txt

# Or generate flamegraph (requires tools)
npm install -g stackvis
stackvis < profile.txt | open # macOS
# or Windows: stackvis < profile.txt > profile.html
```

**Analyzing CPU Profile (Key sections):**

```
Ticks  Function Name
------  ──────────────────────────────────────────
 1230   ~ .createPost (packages/backend/src/services/post.service.ts:45)
 1045   ~ .getAuthToken (packages/backend/src/auth/auth.service.ts:120)
  890   ~ Database query execution (Prisma ORM)

Statistical profiling results:
 - JavaScript: 23% (app code hotspots)
 - Built-ins: 45% (Node.js internals)
 - GC: 12% (garbage collection overhead)
 - Other: 20% (C++ bindings)
```

**Interpretation:**
- Functions taking >5% of CPU are optimization candidates
- Heavy GC% indicates memory pressure
- Database queries should be <30% total

---

## 1.2 Real-time Profiling (Inspector)

**Enable Node.js Inspector:**

```bash
# Start with inspection enabled
node --inspect=0.0.0.0:9229 packages/backend/dist/main.js

# In another terminal, run K6
k6 run --vus 500 --duration 3m tests/load-test.js
```

**Connect DevTools:**

```bash
# Option 1: Chrome DevTools
open chrome://inspect/
# Click "inspect" on Node.js process

# Option 2: VS Code
# Add to .vscode/launch.json
{
  "type": "node",
  "request": "attach",
  "name": "Attach to Remote",
  "address": "localhost",
  "port": 9229
}
```

**In Chrome DevTools:**
- Go to **Performance** tab
- Click **Record** before K6 starts
- Run K6 test
- Stop recording after 1-2 minutes
- Analyze flame chart for hotspots

**Key Metrics in DevTools:**
- CPU Timeline (yellow = heavy JS, red = forced reflow)
- Call tree (which functions consume most time)
- Memory graph (detect leaks)

---

## 2. Memory Profiling

### 2.1 Heap Snapshots

**Capture heap at peak load:**

```bash
# Start backend with inspection
node --inspect packages/backend/dist/main.js &
BACKEND_PID=$!

# Let it run for 5 seconds
sleep 5

# Trigger garbage collection before snapshot (if possible)
# This requires inspector client

# Take heap snapshot
node -e "
const inspector = require('inspector');
const fs = require('fs');
const session = new inspector.Session();
session.connect();

session.post('HeapProfiler.takeHeapSnapshot', null, (err, result) => {
  fs.writeFileSync('heap-snapshot.json', JSON.stringify(result.heapSnapshot));
  session.disconnect();
});
"
```

**Alternative: Use Chrome DevTools**

```bash
# In Chrome DevTools (Performance tab)
# 1. Click "Memory" tab
# 2. Click "Heap snapshots"
# 3. Take snapshot before test
# 4. Run K6 test (100 users for 2 minutes)
# 5. Take snapshot after test
# 6. Select "Comparison" view
# 7. Identify retained objects
```

### 2.2 Memory Growth Analysis

```bash
# Monitor memory during test
node --max-old-space-size=2048 packages/backend/dist/main.js

# In monitoring script (run alongside K6)
setInterval(() => {
  const mem = process.memoryUsage();
  console.log(`
    RSS: ${Math.round(mem.rss / 1024 / 1024)}MB
    Heap: ${Math.round(mem.heapUsed / 1024 / 1024)}MB / ${Math.round(mem.heapTotal / 1024 / 1024)}MB
    External: ${Math.round(mem.external / 1024 / 1024)}MB
  `);
}, 5000);
```

**Expected Memory Behavior:**
```
Start:    ~150MB (baseline)
5 min:    ~300MB (loaded)
10 min:   ~350MB (steady)
20 min:   ~380MB (slight growth OK)

BAD: Continuous growth → memory leak
GOOD: Plateau after ramp-up
```

### 2.3 Identifying Memory Leaks

```bash
# 1. Compare heap snapshots
# In Chrome DevTools:
# - Retainers: Shows what's holding memory
# - Detached DOM nodes: Indicates React issues
# - Event listeners: Check for unremoved listeners

# 2. Check for unclosed resources
grep -r "\.close\|\.destroy" packages/backend/src/ | head -20

# 3. Monitor specific objects
const userCache = new Map(); // Check if growing
console.log('Cache size:', userCache.size);
```

---

## 3. I/O Profiling (Database)

### 3.1 PostgreSQL Query Profiling

**Enable query logging:**

```sql
-- In PostgreSQL

-- Log all queries taking > 1 second
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Log query plans
ALTER SYSTEM SET log_statement = 'all';

-- Reload config
SELECT pg_reload_conf();

-- View slow queries
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

**In Prisma (add logging):**

```typescript
// packages/backend/src/app.module.ts

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 100) {  // Log queries > 100ms
    console.warn(`[SLOW QUERY - ${e.duration}ms] ${e.query}`);
    console.warn(`Params: ${JSON.stringify(e.params)}`);
  }
});
```

**Expected Database Performance:**
```
Get feed (20 posts): < 50ms
Create post: < 100ms
Like post: < 30ms
Get user profile: < 40ms
Follow user: < 80ms

During 1000 concurrent users:
P95: < 200ms
P99: < 500ms
```

### 3.2 Query Analysis with EXPLAIN

```sql
-- Analyze feed query performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT p.*, u.id, u.username, u.avatar,
       COUNT(DISTINCT l.id) as likes_count
FROM posts p
JOIN users u ON p.author_id = u.id
LEFT JOIN likes l ON p.id = l.post_id
WHERE p.status = 'PUBLISHED'
GROUP BY p.id, u.id
ORDER BY p.created_at DESC
LIMIT 20;

-- Look for:
-- - Seq Scan (bad) → should be Index Scan
-- - Buffer stats (shows cache efficiency)
-- - Actual Time (execution time)
```

---

## 4. Redis Profiling

### 4.1 Redis Performance Monitoring

```bash
# Real-time stats
redis-cli --stat

# Slow command log (track commands > 10ms)
redis-cli CONFIG SET slowlog-log-slower-than 10000
redis-cli SLOWLOG GET 20

# Latency histogram
redis-cli LATENCY DOCTOR

# Memory analysis
redis-cli INFO memory
redis-cli --bigkeys

# Command stats
redis-cli INFO commandstats
```

**Interpreting Redis Stats:**

```
clients: 450           # Connected clients
mem_used_human: 1.2G   # Heap usage
evicted_keys: 12       # Keys evicted (should be low)
keyspace_hits: 950000  # Cache hits
keyspace_misses: 5000  # Cache misses
hit_ratio: 99.5%       # Should be > 95%

# Slow commands
redis-cli SLOWLOG GET
> ID=100, Duration=45000μs, Args=[LPUSH, queue:job, ...]
> ID=101, Duration=12000μs, Args=[HSET, session:123, ...]
```

### 4.2 BullMQ Job Analysis

```typescript
// Monitor job queue depth during test
import Queue from 'bull';

const transcodingQueue = new Queue('transcoding', { redis });

setInterval(async () => {
  const waiting = await transcodingQueue.getWaitingCount();
  const active = await transcodingQueue.getActiveCount();
  const delayed = await transcodingQueue.getDelayedCount();

  console.log(`
    Queue Status:
    - Waiting: ${waiting}
    - Active: ${active}
    - Delayed: ${delayed}
  `);
}, 10000);
```

---

## 5. System-Level Profiling

### 5.1 CPU & Memory Usage

```bash
# macOS/Linux: Monitor top processes
top -o %CPU -o %MEM

# Watch memory growth
watch -n 1 'ps aux | grep node'

# Windows PowerShell
Get-Process node | Select-Object Name, Id, WorkingSet, CPU | Format-Table -AutoSize
```

### 5.2 Network I/O

```bash
# Monitor network traffic (Linux)
iftop -i eth0

# Or use ss for socket statistics
ss -s  # Summary
ss -ant | grep ESTAB | wc -l  # Active connections

# macOS
netstat -an | grep ESTABLISHED | wc -l
```

### 5.3 Disk I/O

```bash
# Linux: Monitor disk reads/writes
iostat -x 1

# Check database log disk usage
du -sh /var/lib/postgresql/data
du -sh /var/lib/redis

# Monitor file descriptor usage
lsof -p <PID> | wc -l  # Should be < 1024
```

---

## 6. Profiling Checklist for K6 Load Test

### Before Test
- [ ] Clear old profile files: `rm isolate-*.log heap-*.json`
- [ ] Start backend with `--prof` flag
- [ ] Verify Redis is running and monitored
- [ ] Open DevTools (Chrome Inspector or VS Code)
- [ ] Clear browser cache

### During Test (50-500 users)
- [ ] Monitor `redis-cli --stat` output
- [ ] Record DevTools performance
- [ ] Watch node process memory (top/Task Manager)
- [ ] Note any console errors

### During Test (500-1000 users peak)
- [ ] Check for memory leaks (steadily increasing?)
- [ ] Monitor database slow query log
- [ ] Track Redis evictions (should be < 1%)
- [ ] Note K6 request errors/latency increase

### After Test
- [ ] Stop backend (generates `isolate-*.log`)
- [ ] Process CPU profile: `node --prof-process isolate-*.log > cpu-profile.txt`
- [ ] Export DevTools performance trace
- [ ] Take final heap snapshot
- [ ] Gather all metrics

---

## 7. Performance Analysis Tools

### 7.1 Flamegraph Generation

```bash
# Install stackvis
npm install -g stackvis

# Process profile and generate HTML
node --prof-process isolate-*.log > stacks.txt
cat stacks.txt | stackvis > flamegraph.html
open flamegraph.html
```

### 7.2 Autocannon Benchmarking

```bash
# Test specific endpoints under sustained load
npm install -g autocannon

# Run benchmark
autocannon -c 50 -d 30 http://localhost:3000/api/feed

# Shows:
# - Requests/sec
# - Latency percentiles
# - Throughput
```

### 7.3 clinic.js for Auto-Diagnosis

```bash
# Install clinic
npm install -g clinic

# Profile with automatic diagnosis
clinic doctor -- node packages/backend/dist/main.js

# (Run K6 in another terminal)
# (Stop with Ctrl+C)

# Generates HTML report with diagnosis
open clinic-*.html
```

---

## 8. Expected Baseline Metrics

**Single Backend Instance (No Load Test):**
- Memory: 150MB
- CPU: <5%
- Node heap: 80MB
- Response time (avg): <10ms

**Under K6 Load (500 concurrent users, 5 minutes):**
- Memory: 400-500MB
- CPU: 60-80%
- Node heap: 250MB
- Response time (P95): 100-200ms
- Response time (P99): 200-400ms
- Database: <100ms average query time
- Redis hit ratio: >95%

**Under Peak Load (1000 concurrent users, 10 minutes):**
- Memory: 600-700MB (should plateau)
- CPU: 80-95%
- Response time (P95): 200-300ms
- Response time (P99): 400-600ms
- No memory leak (flat growth after 5 min)
- No spike in evictions

---

## 9. Optimization Actions Based on Profile

**If CPU > 85%:**
1. Reduce worker concurrency (BullMQ)
2. Add caching layer (Redis)
3. Optimize database queries (add indexes)
4. Profile with `--prof` to identify hot functions

**If Memory > 700MB:**
1. Check for memory leaks (heap snapshots)
2. Reduce cache size (Redis eviction)
3. Paginate responses (smaller chunks)
4. Monitor connection pool (closing unused connections?)

**If Database P95 > 300ms:**
1. Add missing indexes
2. Optimize N+1 queries (use JOIN instead of multiple queries)
3. Increase PostgreSQL shared_buffers
4. Review slow query log

**If Redis Hit Ratio < 90%:**
1. Increase `maxmemory` (if available)
2. Check key TTL settings
3. Review cache invalidation logic
4. Profile hottest keys

---

## 10. Deployment Steps

**Week 4 Profiling Timeline:**

| Day | Action | Duration | Expected Result |
|-----|--------|----------|-----------------|
| Day 1 | Baseline profiling (0 users) | 5 min | Capture baseline CPU, memory, DB |
| Day 2 | Ramp-up test (100→500 users) | 20 min | Monitor scaling behavior |
| Day 3 | Peak load test (1000 users) | 15 min | Capture peak metrics |
| Day 4 | Sustained load (1000 users) | 30 min | Verify stability, no leaks |
| Day 5 | Analysis & optimization | - | Generate profile reports |
| Day 6 | Re-test after optimizations | 15 min | Validate improvements |
| Day 7 | Performance summary & docs | - | Update EXECUTION_SUMMARY |

---

## References

- [Node.js Profiling Guide](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html)
- [Redis CLI](https://redis.io/commands/)
- [clinic.js](https://clinicjs.org)
