# DAIRA Platform - Technical Architecture
**Meta/Senior Level Design Document**

## Executive Summary

DAIRA is a horizontally scalable, Egypt-native social media platform built on modern distributed systems principles. This architecture supports millions of users with <100ms p95 latency while maintaining ACID guarantees where needed and eventual consistency where acceptable.

---

## Architecture Principles

### 1. **CAP Theorem Decisions**
- **Consistency**: ACID for financial transactions (tips, payouts), user authentication
- **Availability**: Eventually consistent for social graph, feeds, analytics
- **Partition Tolerance**: Always prioritized; graceful degradation on network splits

### 2. **Design Patterns**
- **CQRS**: Separate read/write models for feeds and high-volume operations
- **Event Sourcing**: All user actions tracked in `events` table for analytics/audit
- **Saga Pattern**: Distributed transactions for multi-step operations (subscriptions, payouts)
- **Circuit Breaker**: Protect against cascading failures
- **Bulkhead**: Isolate critical paths (auth, payments) from social features

### 3. **Data Strategy**
- **Hot/Warm/Cold**: Recent posts in memory (Redis), 30-day in Postgres, 30d+ in ClickHouse
- **Denormalization**: Counters (likes, follows) for read performance
- **Materialized Views**: Pre-computed analytics refreshed on schedule
- **Partitioning**: Time-based for posts, events, audit logs

---

## Feed Ranking Algorithm

### Hybrid Fanout/Fanin Architecture

**Problem**: Pure fanout = write amplification; Pure fanin = slow reads

**Solution**: Hybrid approach based on user type

#### **Fanout** (for users with <10k followers)
```
User posts → Immediate write to followers' timeline_inbox
Latency: ~50ms for 1000 followers
```

#### **Fanin** (for users with >10k followers)
```
User posts → Write to own timeline only
Follower reads → Query + merge + rank in real-time
Latency: ~200ms with caching
```

### Ranking Formula

```python
score = (
    0.35 * affinity_score +      # Your relationship with author
    0.35 * quality_score +        # Post engagement rate
    0.15 * freshness_score +      # Recency (exponential decay)
    0.10 * diversity_score -      # Content type variety
    0.40 * negative_score         # Reports, blocks, spam signals
)
```

---

## Performance Benchmarks

### Target SLAs

| Operation | p50 | p95 | p99 |
|-----------|-----|-----|-----|
| Feed Load | <50ms | <100ms | <200ms |
| Post Create | <30ms | <60ms | <100ms |
| Search | <100ms | <200ms | <400ms |
| GraphQL Query | <40ms | <80ms | <150ms |

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-01  
**Author**: Principal Backend Architect  
**Status**: Production-Ready
