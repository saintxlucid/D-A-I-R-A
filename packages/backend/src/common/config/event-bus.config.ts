import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Event Bus Configuration
 *
 * Manages all settings for the circulatory system:
 * - BullMQ job queues (async processing)
 * - Redis pub/sub (real-time events)
 * - Event routing & delivery guarantees
 */
@Injectable()
export class EventBusConfig {
  readonly queues = {
    // Critical services (high priority, guaranteed delivery)
    payments: { name: 'payments', defaultPriority: 10, attempts: 5 },
    notifications: { name: 'notifications', defaultPriority: 8, attempts: 3 },
    emailQueue: { name: 'emails', defaultPriority: 7, attempts: 3 },

    // Video processing (long-running tasks)
    videoTranscode: { name: 'video-transcode', defaultPriority: 5, attempts: 2, timeout: 3600000 },
    thumbnailGeneration: { name: 'thumbnail-generation', defaultPriority: 5, attempts: 2, timeout: 600000 },
    videoAnalytics: { name: 'video-analytics', defaultPriority: 3, attempts: 2, timeout: 300000 },

    // Feed generation (fan-out tasks)
    feedFanOut: { name: 'feed-fan-out', defaultPriority: 9, attempts: 2, timeout: 120000 },
    feedRefresh: { name: 'feed-refresh', defaultPriority: 4, attempts: 1, timeout: 60000 },

    // Analytics & tracking
    eventTracking: { name: 'event-tracking', defaultPriority: 2, attempts: 1, timeout: 30000 },
    analyticsAggregation: { name: 'analytics-aggregation', defaultPriority: 2, attempts: 2, timeout: 60000 },

    // ML & recommendations
    vectorEmbedding: { name: 'vector-embedding', defaultPriority: 3, attempts: 2, timeout: 600000 },
    vectorUpdate: { name: 'vector-update', defaultPriority: 2, attempts: 1, timeout: 30000 },

    // Moderation & admin
    contentModeration: { name: 'content-moderation', defaultPriority: 8, attempts: 2, timeout: 120000 },
    adminActions: { name: 'admin-actions', defaultPriority: 9, attempts: 3, timeout: 60000 },
  };

  readonly pubSubChannels = {
    // Real-time user events (low latency)
    userOnline: 'user:online',
    userOffline: 'user:offline',
    userTyping: 'user:typing:*',
    userStatusChanged: 'user:status:*',

    // Real-time content events
    postCreated: 'post:created',
    postDeleted: 'post:deleted',
    commentAdded: 'comment:added:*',
    likeAdded: 'like:added:*',

    // Real-time notifications
    notificationSent: 'notification:sent:*',
    mentionReceived: 'mention:received:*',

    // Real-time chat
    messageReceived: 'message:received:*',
    typingIndicator: 'typing:*:*',

    // System events
    systemHealthCheck: 'system:health',
    systemAlert: 'system:alert',
  };

  readonly dlq = {
    // Dead Letter Queue for failed messages
    name: 'dlq',
    maxRetries: 3,
    ttl: 604800000, // 7 days
  };

  readonly eventRetryPolicy = {
    exponential: {
      baseDelay: 1000,      // 1 second
      maxDelay: 3600000,    // 1 hour
      multiplier: 2,
    },
    linear: {
      delay: 5000,          // 5 seconds
      maxRetries: 10,
    },
  };

  readonly bulkOperationThresholds = {
    feedFanOut: 100,        // Process in batches of 100 followers
    analyticsAggregation: 1000,  // Batch 1000 events
    vectorUpdate: 50,       // Update 50 users at a time
  };

  constructor(private configService: ConfigService) {}

  getRedisConfig() {
    return {
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      db: this.configService.get('REDIS_DB', 0),
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    };
  }

  getQueueConfig(queueName: string) {
    const queue = this.queues[queueName];
    if (!queue) {
      throw new Error(`Queue ${queueName} not configured`);
    }

    return {
      name: queue.name,
      defaultJobOptions: {
        attempts: queue.attempts || 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
      settings: {
        maxStalledCount: 2,
        lockDuration: 30000,
        lockRenewTime: 15000,
      },
    };
  }
}
