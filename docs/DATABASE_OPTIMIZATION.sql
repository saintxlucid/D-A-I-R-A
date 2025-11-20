-- Database Performance Optimization Script for Phase 6
-- Run against PostgreSQL database before Week 4 load testing

-- ============================================================================
-- 1. CREATE MISSING INDEXES (Critical for performance at scale)
-- ============================================================================

-- Posts indexes (feed queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_author_created
  ON posts(author_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_status_created
  ON posts(status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_created
  ON posts(created_at DESC)
  WHERE status = 'PUBLISHED';

-- Follows indexes (relationship queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_follows_follower_created
  ON follows(follower_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_follows_following_follower
  ON follows(following_id, follower_id);

-- Likes indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_likes_post_user
  ON likes(post_id, user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_likes_created
  ON likes(created_at DESC);

-- Comments indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_post_created
  ON comments(post_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_author_created
  ON comments(author_id, created_at DESC);

-- Users indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email
  ON users(email)
  WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username
  ON users(username)
  WHERE deleted_at IS NULL;

-- Sessions indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user_token
  ON sessions(user_id, refresh_token);

-- ============================================================================
-- 2. ANALYZE QUERY PERFORMANCE
-- ============================================================================

-- Run EXPLAIN ANALYZE on common queries to identify bottlenecks

EXPLAIN ANALYZE
SELECT p.*, u.id, u.username, u.avatar,
       COUNT(DISTINCT l.id) as likes_count,
       COUNT(DISTINCT c.id) as comments_count
FROM posts p
JOIN users u ON p.author_id = u.id
LEFT JOIN likes l ON p.id = l.post_id
LEFT JOIN comments c ON p.id = c.post_id
WHERE p.status = 'PUBLISHED'
GROUP BY p.id, u.id
ORDER BY p.created_at DESC
LIMIT 20;

EXPLAIN ANALYZE
SELECT p.*
FROM posts p
JOIN follows f ON p.author_id = f.following_id
WHERE f.follower_id = 'user_id_here'
  AND p.status = 'PUBLISHED'
ORDER BY p.created_at DESC
LIMIT 20;

-- ============================================================================
-- 3. CONFIGURE POSTGRESQL PERFORMANCE PARAMETERS
-- ============================================================================

-- Increase shared buffers (for 8GB server: set to 2GB)
ALTER SYSTEM SET shared_buffers = '2GB';

-- Increase effective cache size
ALTER SYSTEM SET effective_cache_size = '6GB';

-- Increase work memory for sorting
ALTER SYSTEM SET work_mem = '256MB';

-- Increase maintenance work memory for index creation
ALTER SYSTEM SET maintenance_work_mem = '512MB';

-- Enable parallel query execution
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;
ALTER SYSTEM SET max_parallel_workers = 8;
ALTER SYSTEM SET max_worker_processes = 8;

-- Optimize random page access cost (for SSD: lower value)
ALTER SYSTEM SET random_page_cost = 1.1;

-- Select the PostgreSQL planner to use query parallelism
ALTER SYSTEM SET jit = on;

-- Reload configuration
SELECT pg_reload_conf();

-- ============================================================================
-- 4. VACUUM AND ANALYZE (Maintenance)
-- ============================================================================

-- Full vacuum to reclaim disk space
VACUUM FULL ANALYZE;

-- Or simpler approach (less locking)
VACUUM ANALYZE;

-- ============================================================================
-- 5. TABLE-LEVEL OPTIMIZATIONS
-- ============================================================================

-- Set autovacuum parameters for high-traffic tables
ALTER TABLE posts SET (
  autovacuum_vacuum_scale_factor = 0.01,
  autovacuum_analyze_scale_factor = 0.005
);

ALTER TABLE follows SET (
  autovacuum_vacuum_scale_factor = 0.01,
  autovacuum_analyze_scale_factor = 0.005
);

ALTER TABLE likes SET (
  autovacuum_vacuum_scale_factor = 0.001,
  autovacuum_analyze_scale_factor = 0.0005
);

-- ============================================================================
-- 6. CONNECTION POOLING CONFIGURATION (For Backend App)
-- ============================================================================

-- Recommended settings for backend application (via Prisma or direct)
-- max_connections = 200 (adjust based on application needs)
-- max_prepared_transactions = 100
-- Connection pooling: Use PgBouncer with min_pool_size=10, default_pool_size=25

-- ============================================================================
-- 7. PARTITION STRATEGY (For >10M records)
-- ============================================================================

-- Optional: Partition posts table by date for very large datasets
-- CREATE TABLE posts_2024_q1 PARTITION OF posts
--   FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

-- ============================================================================
-- 8. MONITORING QUERIES (Run periodically during load test)
-- ============================================================================

-- Check slow queries
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check table size
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Check cache hit ratio (should be >99%)
SELECT
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit)  as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;

-- ============================================================================
-- 9. REDIS OPTIMIZATION (For Session/Cache)
-- ============================================================================

-- Redis configuration recommendations
-- maxmemory = 2gb
-- maxmemory-policy = allkeys-lru (Least Recently Used eviction)
-- appendonly = yes (for persistence)
-- appendfsync = everysec (balance between safety and performance)

-- Suggested Redis commands:
-- INFO stats (check evictions, expiry)
-- SLOWLOG GET (identify slow operations)
-- CLIENT LIST (monitor active connections)
