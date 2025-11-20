# Redis Tuning Guide for Phase 6 Scale Testing

**Purpose:** Optimize Redis for 1000+ concurrent users during Week 4 load testing
**Target Metrics:** <10ms response time, <5% eviction rate, >95% cache hit ratio

---

## 1. Memory Management Configuration

### 1.1 Memory Limits
```bash
# redis.conf or via CONFIG SET

# For 4GB available memory on server
maxmemory 2gb

# Define eviction policy when max memory reached
# Options: noeviction, allkeys-lru, volatile-lru, allkeys-random, volatile-random
maxmemory-policy allkeys-lru
```

**Recommended Policy for DAIRA:**
- **allkeys-lru** (Least Recently Used): Evicts any key not recently accessed
- Best for session storage + caching (tolerate some data loss)
- Alternative: **volatile-lru** if only want to evict keys with TTL set

### 1.2 LRU vs LFU Sample Configs

```bash
# LRU (default) - Track least recently accessed
maxmemory-policy allkeys-lru
maxmemory-samples 5  # Check 5 random keys, pick least used

# LFU (frequency) - For stable workloads
maxmemory-policy allkeys-lfu
lfu-log-factor 10        # Higher = more accurate frequency tracking
lfu-decay-time 1         # Minutes before decay counters
```

### 1.3 Memory Monitoring

```bash
# Check current memory usage
INFO memory

# Expected output analysis:
# used_memory_human: 1.2G (actual heap usage)
# used_memory_peak_human: 1.5G (peak during test)
# used_memory_rss_human: 1.8G (resident set size)
# mem_fragmentation_ratio: 1.1 (< 1.5 is good)
```

---

## 2. Persistence Configuration (AOF vs RDB)

### 2.1 RDB (Snapshot) - Recommended for Cache
```bash
# redis.conf

# Save snapshot every 900 seconds if 1 key changed
save 900 1

# Save every 300 seconds if 10 keys changed
save 300 10

# Save every 60 seconds if 10000 keys changed
save 60 10000

# Disable snapshots (if you don't need recovery)
# save ""
```

### 2.2 AOF (Append Only File) - For Session Data
```bash
# Enable AOF
appendonly yes

# Write to disk every command (safest, slowest)
appendfsync always

# Write to disk every second (balanced - RECOMMENDED)
appendfsync everysec

# Write to disk when OS decides (fastest, risky)
appendfsync no

# Auto rewrite AOF file when size exceeds 64MB
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 67108864

# Disable fsync during rewrite
aof-use-rdb-preamble yes
```

**For DAIRA Phase 6:**
```bash
# Balance performance + reliability
appendonly yes
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 100mb
```

---

## 3. Connection & Command Optimization

### 3.1 Connection Pool Settings

```bash
# redis.conf

# Max number of connected clients
maxclients 10000

# TCP backlog (connection queue)
tcp-backlog 511

# Keep alive timeout (seconds, 0 = disable)
timeout 0

# Enable TCP keep-alive
tcp-keepalive 300
```

### 3.2 Command Optimization

```bash
# BullMQ-specific: Batch operations

# GOOD: Single command
LPUSH queue:job job1 job2 job3  # Atomic, 1 round-trip

# BAD: Multiple commands
LPUSH queue:job job1
LPUSH queue:job job2
LPUSH queue:job job3
# 3 round-trips instead of 1

# Pipeline in code (Node.js)
const pipeline = redis.pipeline();
pipeline.lpush('queue:job', job1);
pipeline.lpush('queue:job', job2);
pipeline.lpush('queue:job', job3);
await pipeline.exec();
```

---

## 4. BullMQ-Specific Tuning

### 4.1 Queue Configuration (TypeScript)

```typescript
// packages/backend/src/modules/media/media.module.ts

const bullConfig = {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000  // Start 2s, doubles on retry
    },
    removeOnComplete: {
      age: 3600   // Keep for 1 hour
    },
    removeOnFail: false  // Keep failed for debugging
  },
  settings: {
    maxStalledCount: 2,           // Max times job can stall
    stalledInterval: 5000,        // Check every 5s
    maxRetriesPerWorker: 5,
    lockDuration: 30000,          // 30s lock timeout
    lockRenewTime: 15000          // Renew every 15s
  }
};

new Queue('transcoding', { connection: redis, ...bullConfig });
```

### 4.2 Worker Configuration

```typescript
// packages/backend/src/modules/media/transcoding.processor.ts

const worker = new Worker('transcoding', processor, {
  connection: redis,
  concurrency: 4,         // Process 4 jobs simultaneously
  maxStalledCount: 2,
  stalledInterval: 5000,
  lockRenewTime: 15000,
  settings: {
    backoffStrategy: async (attemptsMade) => {
      return Math.min(attemptsMade * 5000, 60000);  // 5s, 10s, 15s... max 60s
    }
  }
});
```

---

## 5. Performance Monitoring

### 5.1 Redis INFO Command

```bash
# Real-time monitoring during load test
redis-cli INFO stats

# Expected metrics:
# total_commands_processed: Should grow steadily
# instantaneous_ops_per_sec: Should be >5000 during test
# rejected_connections: Should be 0 (no evictions)
# evicted_keys: Monitor eviction rate (< 5% acceptable)
# expired_keys: Natural expiry (good, not eviction)
```

### 5.2 Key Eviction Monitoring

```bash
# Monitor evictions in real-time
redis-cli --stat

# Shows:
# keys      - Total keys in database
# memory    - Memory usage
# evicted_keys - Keys removed by eviction policy
# If evicted_keys increases rapidly → memory pressure

# Check eviction stats
redis-cli INFO stats | grep evicted
```

### 5.3 Slow Query Log

```bash
# Enable slow query logging (10ms threshold)
CONFIG SET slowlog-max-len 100
CONFIG SET slowlog-log-slower-than 10000  # microseconds

# View slow queries
redis-cli SLOWLOG GET 10

# Clear slow log
redis-cli SLOWLOG RESET
```

---

## 6. Network & I/O Optimization

### 6.1 Network Settings

```bash
# redis.conf

# Disable Nagle's algorithm (reduce latency)
tcp-keepalive 300

# Buffer size for command output
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
```

### 6.2 Data Structure Optimization

```bash
# Use appropriate data structures

# BAD: Store each session as separate key
SET session:user1 data1
SET session:user2 data2
# Many key lookups, slow enumeration

# GOOD: Use HASH
HSET sessions user1 data1
HSET sessions user2 data2
# Single lookup, faster enumeration

# BullMQ internals use HASH for job metadata
```

---

## 7. Deployment Checklist

### Before Load Test
- [ ] Set `maxmemory` to 2GB
- [ ] Set `maxmemory-policy` to `allkeys-lru`
- [ ] Configure `appendfsync everysec`
- [ ] Enable AOF: `appendonly yes`
- [ ] Set `maxclients` to 10000
- [ ] Create custom save points for RDB
- [ ] Clear old AOF files

### During Load Test (Real-time Monitoring)
```bash
# Terminal 1: Watch memory/ops
redis-cli --stat

# Terminal 2: Monitor slow queries
redis-cli SLOWLOG GET 1 | watch -n 1

# Terminal 3: Check K6 load test progress
# (in separate terminal with: k6 run tests/load-test.js)
```

### Performance Validation
```bash
# After 1000 concurrent users sustained:
redis-cli INFO stats
# Check:
# - evicted_keys < 5% of max_keys
# - keyspace_hits / (keyspace_hits + keyspace_misses) > 95%
# - instantaneous_ops_per_sec > 5000

redis-cli INFO replication
# Check:
# - connected_clients < 1000 (monitor for leaks)

redis-cli SLOWLOG GET 10
# Check:
# - < 5 commands in slow log
# - All within 50ms (not critical)
```

---

## 8. Troubleshooting

### High Memory Usage
```bash
# Check memory by key prefix
redis-cli --bigkeys

# Check key size distribution
redis-cli --memkeys

# Solution: Review TTL settings
redis-cli SCAN 0 MATCH "session:*"
# Should see TTL expiring keys

# Manually evict keys
redis-cli CONFIG SET maxmemory-policy volatile-lru
# Or clean up manually
redis-cli EVAL "return redis.call('del', unpack(redis.call('keys', 'old:*')))" 0
```

### High CPU Usage
```bash
# Check command latency distribution
redis-cli LATENCY LATEST

# Monitor command breakdown
redis-cli COMMAND INFO GET SET LPUSH RPOP

# Reduce concurrency in BullMQ:
# Change worker concurrency from 4 → 2
```

### Eviction/Rejection
```bash
# Check if clients are being rejected
redis-cli INFO stats | grep rejected_connections

# If > 0: Increase maxclients
redis-cli CONFIG SET maxclients 20000

# Or increase maxmemory
redis-cli CONFIG SET maxmemory 3gb
```

---

## 9. Production Configuration (Final)

```bash
# /etc/redis/redis.conf (or docker-compose environment)

# Memory
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence
appendonly yes
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 100mb

# Connection
maxclients 10000
tcp-backlog 511
timeout 0
tcp-keepalive 300

# Performance
hz 10                  # Higher = more responsive, more CPU
dynamic-hz yes         # Auto-adjust based on connections

# Replication (if cluster)
repl-diskless-sync yes
repl-diskless-sync-delay 5

# Eviction logging
latency-monitor-threshold 0  # Change to 10 for diagnostics
```

---

## 10. Expected Performance During K6 Load Test

**Baseline (Single User):**
- Session operations: <2ms
- Cache get: <1ms
- BullMQ job queue: <5ms

**Under 1000 Concurrent Users:**
- Session operations: <10ms
- Cache get: <5ms
- BullMQ job queue: <20ms
- Memory usage: ~1.2GB (from 2GB limit)
- Evicted keys: < 50 (< 5%)
- Hit ratio: > 95%
- Client connections: 800-1000
- Ops/sec: 5000-10000

**If exceeding targets:**
1. Increase `maxmemory` to 3GB
2. Reduce worker concurrency (BullMQ)
3. Check for memory leaks (COMMAND DOCS / check node process)
4. Review slow queries (SLOWLOG)
5. Increase Redis CPU allocation

---

## References

- [Redis Configuration](https://redis.io/commands/config-set)
- [Redis Memory Management](https://redis.io/topics/memory-optimization)
- [BullMQ Documentation](https://docs.bullmq.io)
- [Redis Persistence](https://redis.io/topics/persistence)
- [Redis Monitoring](https://redis.io/topics/latency-monitor)
