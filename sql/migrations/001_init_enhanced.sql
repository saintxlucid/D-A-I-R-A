-- ============================================================================
-- DAIRA PLATFORM - PRODUCTION DATABASE SCHEMA
-- Meta/Senior Level Architecture
-- ============================================================================
-- PostgreSQL 15+ with advanced patterns:
-- - Partitioning for scale (time-series, high-volume tables)
-- - Soft deletes with audit trail
-- - Optimistic locking with versioning
-- - Materialized views for analytics
-- - Advanced indexing strategies (BRIN, GiST, GIN)
-- - JSONB for flexible schemas
-- - Comprehensive RLS policies
-- - Trigger-based denormalization
-- - Event sourcing patterns for critical data
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";           -- Trigram matching for fuzzy search
CREATE EXTENSION IF NOT EXISTS "btree_gin";         -- Composite GIN indexes
CREATE EXTENSION IF NOT EXISTS "btree_gist";        -- Composite GiST indexes  
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- Query performance monitoring
CREATE EXTENSION IF NOT EXISTS "pgcrypto";          -- Encryption functions
CREATE EXTENSION IF NOT EXISTS "pg_repack";         -- Online table reorganization (if available)

-- ============================================================================
-- HELPER FUNCTIONS & UTILITIES
-- ============================================================================

-- Get current authenticated user ID from session (for RLS)
CREATE OR REPLACE FUNCTION app_user_id() RETURNS INTEGER AS $$
BEGIN
    RETURN NULLIF(current_setting('app.user_id', true), '')::INTEGER;
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Soft delete function
CREATE OR REPLACE FUNCTION soft_delete() RETURNS TRIGGER AS $$
BEGIN
    NEW.deleted_at = NOW();
    NEW.deleted_by = app_user_id();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Increment version for optimistic locking
CREATE OR REPLACE FUNCTION increment_version() RETURNS TRIGGER AS $$
BEGIN
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate snowflake-like ID (distributed ID generation)
CREATE OR REPLACE FUNCTION generate_id(shard_id INTEGER DEFAULT 1) RETURNS BIGINT AS $$
DECLARE
    our_epoch BIGINT := 1640995200000; -- 2022-01-01 00:00:00 UTC
    seq_id BIGINT;
    now_ms BIGINT;
    result BIGINT;
BEGIN
    SELECT nextval('global_id_seq') % 4096 INTO seq_id;
    SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) INTO now_ms;
    result := (now_ms - our_epoch) << 22;
    result := result | (shard_id << 12);
    result := result | seq_id;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS global_id_seq;

-- Audit log function
CREATE OR REPLACE FUNCTION audit_log() RETURNS TRIGGER AS $$
DECLARE
    audit_data JSONB;
BEGIN
    audit_data = jsonb_build_object(
        'timestamp', NOW(),
        'user_id', app_user_id(),
        'operation', TG_OP,
        'table', TG_TABLE_NAME,
        'old', CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
        'new', CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END
    );
    
    INSERT INTO audit_trail (table_name, operation, user_id, data)
    VALUES (TG_TABLE_NAME, TG_OP, app_user_id(), audit_data);
    
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ENUMS (Domain Types)
-- ============================================================================

CREATE TYPE user_type AS ENUM ('regular', 'creator', 'verified_creator', 'brand', 'admin');
CREATE TYPE post_type AS ENUM ('regular', 'sponsored', 'promoted', 'poll', 'event');
CREATE TYPE content_type AS ENUM ('text', 'image', 'video', 'voice', 'carousel', 'live');
CREATE TYPE visibility_scope AS ENUM ('public', 'followers', 'close_friends', 'private', 'unlisted');
CREATE TYPE reaction_type AS ENUM ('like', 'love', 'laugh', 'sad', 'angry', 'save', 'repost');
CREATE TYPE notification_type AS ENUM ('like', 'comment', 'follow', 'mention', 'reply', 'repost', 'tip', 'subscription', 'verification', 'security_alert');
CREATE TYPE moderation_action AS ENUM ('warn', 'shadow_limit', 'content_remove', 'temporary_ban', 'permanent_ban', 'appeal_approved', 'appeal_denied', 'account_restore');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');
CREATE TYPE event_type AS ENUM ('view', 'click', 'impression', 'share', 'save', 'report', 'block');

-- ============================================================================
-- AUDIT & OBSERVABILITY
-- ============================================================================

CREATE TABLE audit_trail (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    user_id INTEGER,
    data JSONB NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
) PARTITION BY RANGE (created_at);

-- Create partitions for audit trail (monthly)
CREATE TABLE audit_trail_2025_01 PARTITION OF audit_trail
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE audit_trail_2025_02 PARTITION OF audit_trail
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE audit_trail_default PARTITION OF audit_trail DEFAULT;

CREATE INDEX idx_audit_trail_table_name ON audit_trail (table_name, created_at DESC);
CREATE INDEX idx_audit_trail_user_id ON audit_trail (user_id, created_at DESC);
CREATE INDEX idx_audit_trail_data_gin ON audit_trail USING gin (data);

-- Performance metrics table
CREATE TABLE performance_metrics (
    id BIGSERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    tags JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
) PARTITION BY RANGE (created_at);

CREATE TABLE performance_metrics_default PARTITION OF performance_metrics DEFAULT;

CREATE INDEX idx_performance_metrics_name_time ON performance_metrics (metric_name, created_at DESC);

-- ============================================================================
-- USERS & AUTHENTICATION (Enhanced)
-- ============================================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uid BIGINT UNIQUE NOT NULL DEFAULT generate_id(), -- Distributed ID
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone VARCHAR(20),
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Password (hashed, use argon2 or bcrypt)
    password_hash VARCHAR(255),
    
    -- Profile
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    location VARCHAR(255),
    website_url TEXT,
    
    -- Creator features
    user_type user_type DEFAULT 'regular' NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    verification_requested_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Metrics (denormalized for performance)
    follower_count INTEGER DEFAULT 0 NOT NULL CHECK (follower_count >= 0),
    following_count INTEGER DEFAULT 0 NOT NULL CHECK (following_count >= 0),
    posts_count INTEGER DEFAULT 0 NOT NULL CHECK (posts_count >= 0),
    creator_score NUMERIC(5,2) DEFAULT 0.0 NOT NULL CHECK (creator_score >= 0 AND creator_score <= 100),
    
    -- Reputation & Trust
    trust_score NUMERIC(3,2) DEFAULT 1.0 NOT NULL CHECK (trust_score >= 0 AND trust_score <= 1),
    warning_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Settings (JSONB for flexibility)
    settings JSONB DEFAULT '{
        "language": "ar",
        "timezone": "Africa/Cairo",
        "notifications": {
            "email": true,
            "push": true,
            "sms": false
        },
        "privacy": {
            "profile_visibility": "public",
            "allow_messages_from": "everyone",
            "show_activity_status": true
        }
    }'::jsonb,
    
    -- Preferences
    preferences JSONB DEFAULT '{}'::jsonb,
    
    -- Security
    two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    two_factor_secret VARCHAR(255),
    backup_codes TEXT[],
    
    -- Status flags
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_private BOOLEAN DEFAULT FALSE NOT NULL,
    is_suspended BOOLEAN DEFAULT FALSE NOT NULL,
    suspended_until TIMESTAMP WITH TIME ZONE,
    suspension_reason TEXT,
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by INTEGER,
    
    -- Optimistic locking
    version INTEGER DEFAULT 1 NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    last_post_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 50),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_user_type CHECK (user_type IS NOT NULL)
);

-- Indexes optimized for common queries
CREATE UNIQUE INDEX idx_users_username_lower ON users (LOWER(username)) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_users_email_lower ON users (LOWER(email)) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_uid ON users (uid);
CREATE INDEX idx_users_user_type ON users (user_type) WHERE user_type IN ('creator', 'verified_creator', 'brand');
CREATE INDEX idx_users_created_at ON users (created_at DESC);
CREATE INDEX idx_users_last_seen_at ON users (last_seen_at DESC) WHERE is_active = TRUE;
CREATE INDEX idx_users_creator_score ON users (creator_score DESC) WHERE user_type IN ('creator', 'verified_creator');
CREATE INDEX idx_users_settings_gin ON users USING gin (settings);

-- Triggers
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_users_version
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION increment_version();

CREATE TRIGGER trigger_users_audit
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_log();

-- Auth sessions with enhanced tracking
CREATE TABLE auth_sessions (
    id SERIAL PRIMARY KEY,
    session_id UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    access_token_hash VARCHAR(255),
    
    -- Device info
    device_fingerprint VARCHAR(255),
    device_id UUID,
    device_name VARCHAR(255),
    device_type VARCHAR(50),
    user_agent TEXT,
    
    -- Network info
    ip_address INET,
    ip_country VARCHAR(2),
    ip_city VARCHAR(100),
    
    -- Security
    is_revoked BOOLEAN DEFAULT FALSE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoke_reason VARCHAR(255),
    
    -- Session lifecycle
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_refreshed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT expires_in_future CHECK (expires_at > created_at)
);

CREATE INDEX idx_auth_sessions_user_id ON auth_sessions (user_id, last_used_at DESC);
CREATE INDEX idx_auth_sessions_session_id ON auth_sessions (session_id) WHERE is_revoked = FALSE;
CREATE INDEX idx_auth_sessions_expires_at ON auth_sessions (expires_at) WHERE is_revoked = FALSE;
CREATE INDEX idx_auth_sessions_refresh_token ON auth_sessions (refresh_token_hash);
CREATE INDEX idx_auth_sessions_device_id ON auth_sessions (device_id, user_id);

-- Security events log
CREATE TABLE security_events (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'info' NOT NULL,
    details JSONB NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
) PARTITION BY RANGE (created_at);

CREATE TABLE security_events_default PARTITION OF security_events DEFAULT;

CREATE INDEX idx_security_events_user_id ON security_events (user_id, created_at DESC);
CREATE INDEX idx_security_events_severity ON security_events (severity, created_at DESC) WHERE severity IN ('warning', 'critical');

-- Rate limiting (in-memory via Redis, but track violations in DB)
CREATE TABLE rate_limit_violations (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    violation_count INTEGER DEFAULT 1 NOT NULL,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_rate_limit_violations_user_id ON rate_limit_violations (user_id, created_at DESC);
CREATE INDEX idx_rate_limit_violations_ip ON rate_limit_violations (ip_address, created_at DESC);

-- ============================================================================
-- SOCIAL GRAPH (Optimized with materialized paths)
-- ============================================================================

CREATE TABLE follows (
    follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' NOT NULL, -- active, pending, blocked
    
    -- Notifications
    notify_posts BOOLEAN DEFAULT TRUE NOT NULL,
    notify_stories BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- Analytics
    source VARCHAR(50), -- suggested, search, profile_visit
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    PRIMARY KEY (follower_id, followed_id),
    CONSTRAINT no_self_follow CHECK (follower_id != followed_id)
);

CREATE INDEX idx_follows_follower_id_status ON follows (follower_id, status, created_at DESC);
CREATE INDEX idx_follows_followed_id_status ON follows (followed_id, status, created_at DESC);
CREATE INDEX idx_follows_created_at ON follows (created_at DESC);

-- Mutual follows (friends) - materialized for performance
CREATE MATERIALIZED VIEW mutual_follows AS
SELECT 
    LEAST(f1.follower_id, f1.followed_id) as user1_id,
    GREATEST(f1.follower_id, f1.followed_id) as user2_id,
    f1.created_at as follow1_at,
    f2.created_at as follow2_at,
    GREATEST(f1.created_at, f2.created_at) as mutual_since
FROM follows f1
JOIN follows f2 ON f1.follower_id = f2.followed_id AND f1.followed_id = f2.follower_id
WHERE f1.status = 'active' AND f2.status = 'active';

CREATE UNIQUE INDEX idx_mutual_follows_users ON mutual_follows (user1_id, user2_id);

CREATE TABLE blocks (
    blocker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (blocker_id, blocked_id),
    CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

CREATE INDEX idx_blocks_blocker_id ON blocks (blocker_id);
CREATE INDEX idx_blocks_blocked_id ON blocks (blocked_id);

-- Close friends circles
CREATE TABLE circles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    member_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_circles_user_id ON circles (user_id);

CREATE TABLE circle_members (
    circle_id INTEGER NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (circle_id, user_id)
);

CREATE INDEX idx_circle_members_user_id ON circle_members (user_id);

-- ============================================================================
-- POSTS (Partitioned by time for scale)
-- ============================================================================

CREATE TABLE posts (
    id BIGSERIAL NOT NULL,
    uid BIGINT UNIQUE NOT NULL DEFAULT generate_id(),
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT NOT NULL,
    content_type content_type DEFAULT 'text' NOT NULL,
    visibility visibility_scope DEFAULT 'public' NOT NULL,
    
    -- Media (JSONB for flexibility)
    media_refs JSONB DEFAULT '[]'::jsonb,
    -- Example: [{"type": "image", "url": "...", "width": 1080, "height": 1920, "blurhash": "..."}]
    
    -- Post classification
    post_type post_type DEFAULT 'regular' NOT NULL,
    is_sponsored BOOLEAN DEFAULT FALSE NOT NULL,
    sponsor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Engagement metrics (denormalized)
    views_count INTEGER DEFAULT 0 NOT NULL CHECK (views_count >= 0),
    unique_views_count INTEGER DEFAULT 0 NOT NULL CHECK (unique_views_count >= 0),
    likes_count INTEGER DEFAULT 0 NOT NULL CHECK (likes_count >= 0),
    comments_count INTEGER DEFAULT 0 NOT NULL CHECK (comments_count >= 0),
    shares_count INTEGER DEFAULT 0 NOT NULL CHECK (shares_count >= 0),
    saves_count INTEGER DEFAULT 0 NOT NULL CHECK (saves_count >= 0),
    
    -- Engagement rate (calculated periodically)
    engagement_rate NUMERIC(5,4) DEFAULT 0 NOT NULL,
    
    -- Metadata
    location VARCHAR(255),
    location_lat NUMERIC(10, 7),
    location_lon NUMERIC(10, 7),
    tagged_user_ids INTEGER[] DEFAULT '{}',
    
    -- Flags
    is_edited BOOLEAN DEFAULT FALSE NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
    comments_disabled BOOLEAN DEFAULT FALSE NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Content safety
    safety_score NUMERIC(3,2) DEFAULT 1.0 NOT NULL,
    is_flagged BOOLEAN DEFAULT FALSE NOT NULL,
    flagged_reason VARCHAR(255),
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by INTEGER,
    
    -- Optimistic locking
    version INTEGER DEFAULT 1 NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    PRIMARY KEY (id, created_at),
    CONSTRAINT content_not_empty CHECK (char_length(content) > 0)
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE posts_2025_01 PARTITION OF posts
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE posts_2025_02 PARTITION OF posts
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE posts_2025_03 PARTITION OF posts
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE posts_default PARTITION OF posts DEFAULT;

-- Indexes (applied to partitions automatically)
CREATE INDEX idx_posts_author_created ON posts (author_id, created_at DESC, visibility);
CREATE INDEX idx_posts_uid ON posts (uid);
CREATE INDEX idx_posts_visibility_created ON posts (visibility, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_post_type ON posts (post_type, created_at DESC);
CREATE INDEX idx_posts_sponsored ON posts (is_sponsored, created_at DESC) WHERE is_sponsored = TRUE;
CREATE INDEX idx_posts_engagement ON posts (engagement_rate DESC, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_location_gist ON posts USING gist (ll_to_earth(location_lat, location_lon)) WHERE location_lat IS NOT NULL;
CREATE INDEX idx_posts_content_gin ON posts USING gin (to_tsvector('english', content));
CREATE INDEX idx_posts_media_gin ON posts USING gin (media_refs);

-- BRIN index for time-series data (very efficient for large tables)
CREATE INDEX idx_posts_created_brin ON posts USING brin (created_at) WITH (pages_per_range = 128);

-- Triggers
CREATE TRIGGER trigger_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_posts_version
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION increment_version();

-- Post statistics (aggregated hourly/daily)
CREATE TABLE post_stats (
    post_id BIGINT NOT NULL,
    stat_date DATE NOT NULL,
    stat_hour INTEGER, -- NULL for daily stats
    
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    avg_watch_time_seconds INTEGER,
    completion_rate NUMERIC(5,4),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    PRIMARY KEY (post_id, stat_date, COALESCE(stat_hour, -1))
);

CREATE INDEX idx_post_stats_date ON post_stats (stat_date DESC, stat_hour DESC);

-- ============================================================================
-- COMMENTS (Nested with materialized path)
-- ============================================================================

CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    uid BIGINT UNIQUE NOT NULL DEFAULT generate_id(),
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    thread_id BIGINT REFERENCES threads(id) ON DELETE CASCADE,
    parent_comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT NOT NULL,
    media_url TEXT,
    
    -- Nested comments (materialized path for efficient queries)
    path LTREE, -- e.g., '1.23.456' for comment 456 under 23 under 1
    depth INTEGER DEFAULT 0 NOT NULL,
    
    -- Metrics
    likes_count INTEGER DEFAULT 0 NOT NULL CHECK (likes_count >= 0),
    replies_count INTEGER DEFAULT 0 NOT NULL CHECK (replies_count >= 0),
    
    -- Flags
    is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by INTEGER,
    
    -- Optimistic locking
    version INTEGER DEFAULT 1 NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT comment_target CHECK (
        (post_id IS NOT NULL AND thread_id IS NULL) OR
        (post_id IS NULL AND thread_id IS NOT NULL)
    ),
    CONSTRAINT content_not_empty CHECK (char_length(content) > 0),
    CONSTRAINT depth_limit CHECK (depth <= 10)
);

CREATE INDEX idx_comments_post_created ON comments (post_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_thread_created ON comments (thread_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_author ON comments (author_id, created_at DESC);
CREATE INDEX idx_comments_parent ON comments (parent_comment_id);
CREATE INDEX idx_comments_path_gist ON comments USING gist (path); -- Efficient ancestor/descendant queries

-- Triggers
CREATE TRIGGER trigger_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_comments_version
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION increment_version();

-- ============================================================================
-- REACTIONS (High-volume, partitioned)
-- ============================================================================

CREATE TABLE reactions (
    id BIGSERIAL NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL, -- post, comment, thread
    target_id BIGINT NOT NULL,
    reaction_type reaction_type DEFAULT 'like' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    PRIMARY KEY (id, created_at),
    UNIQUE (user_id, target_type, target_id, reaction_type, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE reactions_2025_01 PARTITION OF reactions
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE reactions_2025_02 PARTITION OF reactions
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE reactions_default PARTITION OF reactions DEFAULT;

CREATE INDEX idx_reactions_target ON reactions (target_type, target_id, created_at DESC);
CREATE INDEX idx_reactions_user ON reactions (user_id, created_at DESC);
CREATE INDEX idx_reactions_type ON reactions (reaction_type, created_at DESC);

-- ============================================================================
-- HASHTAGS & SOUNDS (Optimized for discovery)
-- ============================================================================

CREATE TABLE hashtags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    normalized_name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    
    -- Metrics
    usage_count INTEGER DEFAULT 0 NOT NULL CHECK (usage_count >= 0),
    trending_score NUMERIC(10,4) DEFAULT 0 NOT NULL,
    
    -- Metadata
    category VARCHAR(50),
    language VARCHAR(2) DEFAULT 'ar',
    
    -- Flags
    is_trending BOOLEAN DEFAULT FALSE NOT NULL,
    is_banned BOOLEAN DEFAULT FALSE NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_hashtags_name ON hashtags (name);
CREATE INDEX idx_hashtags_normalized ON hashtags (normalized_name);
CREATE INDEX idx_hashtags_trending ON hashtags (trending_score DESC, usage_count DESC) WHERE is_trending = TRUE;
CREATE INDEX idx_hashtags_usage ON hashtags (usage_count DESC);
CREATE INDEX idx_hashtags_name_trgm ON hashtags USING gin (name gin_trgm_ops);

CREATE TABLE post_hashtags (
    post_id BIGINT NOT NULL,
    hashtag_id INTEGER NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (post_id, hashtag_id)
);

CREATE INDEX idx_post_hashtags_hashtag ON post_hashtags (hashtag_id, created_at DESC);
CREATE INDEX idx_post_hashtags_post ON post_hashtags (post_id);

-- ============================================================================
-- TIMELINE & FEED INFRASTRUCTURE (Advanced ranking)
-- ============================================================================

CREATE TABLE timeline_inbox (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id BIGINT NOT NULL,
    
    -- Ranking components
    affinity_score NUMERIC(5,4) DEFAULT 0 NOT NULL,
    quality_score NUMERIC(5,4) DEFAULT 0 NOT NULL,
    freshness_score NUMERIC(5,4) DEFAULT 0 NOT NULL,
    diversity_score NUMERIC(5,4) DEFAULT 0 NOT NULL,
    negative_score NUMERIC(5,4) DEFAULT 0 NOT NULL,
    
    -- Final score: 0.35*affinity + 0.35*quality + 0.15*freshness + 0.10*diversity - 0.40*negative
    final_score NUMERIC(6,4) GENERATED ALWAYS AS (
        0.35 * affinity_score + 0.35 * quality_score + 0.15 * freshness_score + 0.10 * diversity_score - 0.40 * negative_score
    ) STORED,
    
    -- Metadata
    source VARCHAR(50), -- fanout, recommendation, trending
    
    -- Lifecycle
    inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days') NOT NULL,
    seen_at TIMESTAMP WITH TIME ZONE,
    
    PRIMARY KEY (user_id, post_id)
);

CREATE INDEX idx_timeline_inbox_user_score ON timeline_inbox (user_id, final_score DESC, inserted_at DESC) WHERE seen_at IS NULL;
CREATE INDEX idx_timeline_inbox_expires ON timeline_inbox (expires_at) WHERE expires_at < NOW();

-- User affinity scores (who you interact with most)
CREATE TABLE user_affinities (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    affinity_score NUMERIC(5,4) DEFAULT 0 NOT NULL,
    last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, target_user_id)
);

CREATE INDEX idx_user_affinities_score ON user_affinities (user_id, affinity_score DESC);

-- ============================================================================
-- ANALYTICS EVENTS (Event sourcing pattern)
-- ============================================================================

CREATE TABLE events (
    id BIGSERIAL NOT NULL,
    event_id UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    event_type event_type NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Event targets
    post_id BIGINT,
    comment_id BIGINT,
    thread_id BIGINT,
    target_user_id INTEGER,
    
    -- Event data
    properties JSONB DEFAULT '{}'::jsonb,
    
    -- Context
    session_id UUID,
    device_id UUID,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    
    -- Geolocation
    country_code VARCHAR(2),
    city VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2025_01 PARTITION OF events
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE events_2025_02 PARTITION OF events
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE events_default PARTITION OF events DEFAULT;

CREATE INDEX idx_events_user_time ON events (user_id, created_at DESC);
CREATE INDEX idx_events_type_time ON events (event_type, created_at DESC);
CREATE INDEX idx_events_post ON events (post_id, event_type, created_at DESC);
CREATE INDEX idx_events_session ON events (session_id, created_at DESC);
CREATE INDEX idx_events_properties_gin ON events USING gin (properties);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Production Grade
-- ============================================================================

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_inbox ENABLE ROW LEVEL SECURITY;

-- Posts RLS: Complex visibility rules
CREATE POLICY posts_select_policy ON posts
    FOR SELECT
    USING (
        deleted_at IS NULL
        AND (
            -- Public posts
            visibility = 'public'
            -- Own posts
            OR author_id = app_user_id()
            -- Followers-only posts from people you follow
            OR (visibility = 'followers' AND EXISTS (
                SELECT 1 FROM follows 
                WHERE follower_id = app_user_id() 
                AND followed_id = author_id 
                AND status = 'active'
            ))
            -- Close friends posts if you're in the circle
            OR (visibility = 'close_friends' AND EXISTS (
                SELECT 1 FROM circle_members cm
                JOIN circles c ON cm.circle_id = c.id
                WHERE c.user_id = author_id
                AND cm.user_id = app_user_id()
            ))
        )
        -- Not blocked
        AND NOT EXISTS (
            SELECT 1 FROM blocks 
            WHERE (blocker_id = app_user_id() AND blocked_id = author_id)
            OR (blocker_id = author_id AND blocked_id = app_user_id())
        )
    );

CREATE POLICY posts_insert_policy ON posts
    FOR INSERT
    WITH CHECK (author_id = app_user_id());

CREATE POLICY posts_update_policy ON posts
    FOR UPDATE
    USING (author_id = app_user_id() AND deleted_at IS NULL);

CREATE POLICY posts_delete_policy ON posts
    FOR DELETE
    USING (author_id = app_user_id());

-- Comments RLS
CREATE POLICY comments_select_policy ON comments
    FOR SELECT
    USING (
        deleted_at IS NULL
        AND (
            -- Can see if you can see the parent post/thread
            EXISTS (SELECT 1 FROM posts WHERE id = comments.post_id)
            OR author_id = app_user_id()
        )
    );

CREATE POLICY comments_insert_policy ON comments
    FOR INSERT
    WITH CHECK (author_id = app_user_id());

CREATE POLICY comments_update_policy ON comments
    FOR UPDATE
    USING (author_id = app_user_id() AND deleted_at IS NULL);

-- Reactions RLS
CREATE POLICY reactions_select_policy ON reactions
    FOR SELECT
    USING (TRUE);

CREATE POLICY reactions_insert_policy ON reactions
    FOR INSERT
    WITH CHECK (user_id = app_user_id());

CREATE POLICY reactions_delete_policy ON reactions
    FOR DELETE
    USING (user_id = app_user_id());

-- Timeline RLS
CREATE POLICY timeline_inbox_select_policy ON timeline_inbox
    FOR SELECT
    USING (user_id = app_user_id());

-- ============================================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================================================

-- Top creators by engagement (refreshed hourly)
CREATE MATERIALIZED VIEW top_creators AS
SELECT 
    u.id,
    u.username,
    u.display_name,
    u.user_type,
    u.creator_score,
    u.follower_count,
    COUNT(DISTINCT p.id) as posts_count,
    COALESCE(SUM(p.likes_count), 0) as total_likes,
    COALESCE(SUM(p.comments_count), 0) as total_comments,
    COALESCE(SUM(p.views_count), 0) as total_views,
    COALESCE(AVG(p.engagement_rate), 0) as avg_engagement_rate
FROM users u
LEFT JOIN posts p ON p.author_id = u.id 
    AND p.deleted_at IS NULL 
    AND p.created_at > NOW() - INTERVAL '30 days'
WHERE u.user_type IN ('creator', 'verified_creator')
    AND u.deleted_at IS NULL
GROUP BY u.id
ORDER BY total_views DESC, total_likes DESC
LIMIT 1000;

CREATE UNIQUE INDEX idx_top_creators_id ON top_creators (id);

-- Trending hashtags (refreshed every 15 minutes)
CREATE MATERIALIZED VIEW trending_hashtags AS
SELECT 
    h.id,
    h.name,
    h.normalized_name,
    COUNT(DISTINCT ph.post_id) as posts_last_24h,
    COUNT(DISTINCT ph.post_id) FILTER (WHERE p.created_at > NOW() - INTERVAL '1 hour') as posts_last_hour,
    h.usage_count,
    -- Trending score based on recent activity
    (
        COUNT(DISTINCT ph.post_id) FILTER (WHERE p.created_at > NOW() - INTERVAL '1 hour') * 10.0 +
        COUNT(DISTINCT ph.post_id) FILTER (WHERE p.created_at > NOW() - INTERVAL '6 hours') * 2.0 +
        COUNT(DISTINCT ph.post_id) FILTER (WHERE p.created_at > NOW() - INTERVAL '24 hours')
    ) as trending_score
FROM hashtags h
LEFT JOIN post_hashtags ph ON ph.hashtag_id = h.id
LEFT JOIN posts p ON p.id = ph.post_id AND p.deleted_at IS NULL
WHERE h.is_banned = FALSE
GROUP BY h.id
HAVING COUNT(DISTINCT ph.post_id) FILTER (WHERE p.created_at > NOW() - INTERVAL '24 hours') > 5
ORDER BY trending_score DESC
LIMIT 100;

CREATE UNIQUE INDEX idx_trending_hashtags_id ON trending_hashtags (id);

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- Active users view (used for recommendations)
CREATE VIEW active_users AS
SELECT *
FROM users
WHERE is_active = TRUE
    AND is_suspended = FALSE
    AND deleted_at IS NULL;

-- Public posts view (most common query)
CREATE VIEW public_posts AS
SELECT *
FROM posts
WHERE visibility = 'public'
    AND deleted_at IS NULL
ORDER BY created_at DESC;

-- ============================================================================
-- MAINTENANCE & OPTIMIZATION
-- ============================================================================

-- Automatically delete old audit trail records (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_audit_trail() RETURNS void AS $$
BEGIN
    DELETE FROM audit_trail WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Refresh materialized views function
CREATE OR REPLACE FUNCTION refresh_analytics_views() RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY top_creators;
    REFRESH MATERIALIZED VIEW CONCURRENTLY trending_hashtags;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mutual_follows;
END;
$$ LANGUAGE plpgsql;

-- Cleanup expired timeline entries
CREATE OR REPLACE FUNCTION cleanup_expired_timeline() RETURNS void AS $$
BEGIN
    DELETE FROM timeline_inbox WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS & DOCUMENTATION
-- ============================================================================

COMMENT ON DATABASE daira IS 'DAIRA Platform - Egypt-native social media platform';
COMMENT ON FUNCTION app_user_id() IS 'Returns authenticated user ID from session for RLS';
COMMENT ON FUNCTION generate_id() IS 'Generates snowflake-like distributed IDs';
COMMENT ON TABLE users IS 'Core user accounts with comprehensive security and privacy';
COMMENT ON TABLE posts IS 'Main content table, partitioned by month for scale';
COMMENT ON TABLE timeline_inbox IS 'Personalized feed cache with hybrid fanout/fanin';
COMMENT ON TABLE events IS 'Event sourcing table for analytics and audit';
COMMENT ON MATERIALIZED VIEW top_creators IS 'Top creators by engagement (refresh hourly)';
COMMENT ON MATERIALIZED VIEW trending_hashtags IS 'Trending hashtags (refresh every 15min)';

-- Grant permissions (adjust as needed for your security model)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO daira_api_role;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO daira_api_role;
