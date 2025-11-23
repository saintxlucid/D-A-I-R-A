/**
 * Circulatory System Utilities
 *
 * Helper functions and utilities for inter-service communication
 */

import { Logger } from '@nestjs/common';
import Redis from 'ioredis';

// ════════════════════════════════════════════════════════════════
// EVENT TIMING & METRICS
// ════════════════════════════════════════════════════════════════

export class EventMetrics {
  /**
   * Track event from publish to completion
   */
  static trackEventLifecycle(eventType: string, redis: Redis) {
    const publishTime = Date.now();
    const metrics = {
      eventType,
      publishedAt: publishTime,
      completedAt: null as number | null,
      durationMs: 0,
    };

    return {
      setComplete: async () => {
        metrics.completedAt = Date.now();
        metrics.durationMs = metrics.completedAt - publishTime;

        const key = `metric:events:${eventType}:lifecycle`;
        await redis.lpush(key, JSON.stringify(metrics));
        await redis.ltrim(key, 0, 999); // Keep last 1000
        await redis.expire(key, 86400); // 24 hours
      },
      getMetrics: () => metrics,
    };
  }

  /**
   * Get event processing statistics
   */
  static async getEventStats(redis: Redis, eventType?: string) {
    if (eventType) {
      const key = `metric:events:${eventType}:lifecycle`;
      const data = await redis.lrange(key, 0, -1);
      const events = data.map((d) => JSON.parse(d));

      const durations = events.map((e) => e.durationMs);
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);

      return {
        eventType,
        count: events.length,
        avgDuration,
        maxDuration,
        minDuration,
      };
    }

    // Get stats for all event types
    const keys = await redis.keys('metric:events:*:lifecycle');
    const stats: Record<string, any> = {};

    for (const key of keys) {
      const eventType = key.split(':')[2];
      const data = await redis.lrange(key, 0, -1);
      const events = data.map((d) => JSON.parse(d));

      if (events.length > 0) {
        const durations = events.map((e) => e.durationMs);
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

        stats[eventType] = {
          count: events.length,
          avgDuration: Math.round(avgDuration),
        };
      }
    }

    return stats;
  }
}

// ════════════════════════════════════════════════════════════════
// BATCH OPERATIONS
// ════════════════════════════════════════════════════════════════

export class BatchOperations {
  private static readonly logger = new Logger(BatchOperations.name);

  /**
   * Process items in batches with concurrency control
   */
  static async processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10,
    concurrency: number = 5,
  ): Promise<R[]> {
    const results: R[] = [];
    const errors: Error[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map((item) => processor(item)),
      );

      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          errors.push(result.reason);
        }
      });

      this.logger.debug(
        `Processed batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(items.length / batchSize)}`,
      );
    }

    if (errors.length > 0) {
      this.logger.warn(`${errors.length} errors in batch processing`);
    }

    return results;
  }

  /**
   * Batch update Redis keys
   */
  static async batchUpdateRedis(
    redis: Redis,
    updates: Array<{ key: string; value: any; ttl?: number }>,
  ) {
    const pipeline = redis.pipeline();

    for (const update of updates) {
      if (update.ttl) {
        pipeline.setex(update.key, update.ttl, JSON.stringify(update.value));
      } else {
        pipeline.set(update.key, JSON.stringify(update.value));
      }
    }

    await pipeline.exec();
    this.logger.debug(`Updated ${updates.length} Redis keys`);
  }
}

// ════════════════════════════════════════════════════════════════
// CIRCUIT BREAKER (Fault Tolerance)
// ════════════════════════════════════════════════════════════════

export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly resetTimeout: number = 60000, // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// ════════════════════════════════════════════════════════════════
// DEDUPLICATION
// ════════════════════════════════════════════════════════════════

export class EventDeduplicator {
  /**
   * Check if event was already processed (idempotency)
   */
  static async isDuplicate(
    redis: Redis,
    eventId: string,
    ttl: number = 3600, // 1 hour
  ): Promise<boolean> {
    const key = `processed:${eventId}`;
    const exists = await redis.exists(key);

    if (exists === 0) {
      await redis.setex(key, ttl, '1');
      return false;
    }

    return true;
  }

  /**
   * Mark event as processed
   */
  static async markProcessed(
    redis: Redis,
    eventId: string,
    ttl: number = 3600,
  ) {
    const key = `processed:${eventId}`;
    await redis.setex(key, ttl, '1');
  }

  /**
   * Clear processed event (for reprocessing)
   */
  static async clearProcessed(redis: Redis, eventId: string) {
    const key = `processed:${eventId}`;
    await redis.del(key);
  }
}

// ════════════════════════════════════════════════════════════════
// RATE LIMITING
// ════════════════════════════════════════════════════════════════

export class RateLimiter {
  /**
   * Sliding window rate limiter
   */
  static async checkLimit(
    redis: Redis,
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Remove old entries
    await redis.zremrangebyscore(key, 0, windowStart);

    // Count current requests
    const count = await redis.zcard(key);

    if (count < limit) {
      // Add new request
      await redis.zadd(key, now, `${now}-${Math.random()}`);
      await redis.expire(key, Math.ceil(windowMs / 1000));

      return { allowed: true, remaining: limit - count - 1 };
    }

    return { allowed: false, remaining: 0 };
  }
}

// ════════════════════════════════════════════════════════════════
// BULK INSERT HELPER
// ════════════════════════════════════════════════════════════════

export class BulkInsertHelper {
  private static readonly logger = new Logger(BulkInsertHelper.name);

  /**
   * Insert records in bulk with batch optimization
   */
  static async bulkInsert<T>(
    records: T[],
    inserter: (batch: T[]) => Promise<void>,
    batchSize: number = 1000,
  ) {
    const totalBatches = Math.ceil(records.length / batchSize);

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;

      try {
        await inserter(batch);
        this.logger.debug(`Inserted batch ${batchNum}/${totalBatches}`);
      } catch (error) {
        this.logger.error(`Failed to insert batch ${batchNum}:`, error);
        throw error;
      }
    }

    this.logger.log(`✅ Bulk insert complete: ${records.length} records`);
  }
}

// ════════════════════════════════════════════════════════════════
// COMPRESSION & SERIALIZATION
// ════════════════════════════════════════════════════════════════

export class Serializer {
  /**
   * Serialize event for transmission (handles large payloads)
   */
  static serialize(data: any): string {
    return JSON.stringify(data);
  }

  /**
   * Deserialize event from transmission
   */
  static deserialize<T = any>(data: string): T {
    return JSON.parse(data);
  }

  /**
   * Check if object should be compressed
   */
  static shouldCompress(data: any): boolean {
    const serialized = JSON.stringify(data);
    return serialized.length > 10000; // > 10KB
  }
}
