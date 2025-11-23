import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue, Job, Worker } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { DomainEvent, eventQueueMapping, eventPriorityMapping } from './event.types';
import { EventBusConfig } from '../config/event-bus.config';

/**
 * Event Bus Service
 *
 * Central hub for all event-driven operations:
 * - Publishes events to appropriate queues
 * - Manages event subscriptions
 * - Handles retries and dead letter queue
 * - Tracks event metrics
 */
@Injectable()
export class EventBusService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventBusService.name);
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private redis: Redis;
  private eventEmitter: EventEmitter2;

  constructor(
    private config: EventBusConfig,
    private eventEmitterService: EventEmitter2,
  ) {
    this.redis = new Redis(this.config.getRedisConfig());
    this.eventEmitter = eventEmitterService;
  }

  async onModuleInit() {
    this.logger.log('🚀 Initializing Event Bus...');

    // Create all queues
    for (const [queueName] of Object.entries(this.config.queues)) {
      await this.initializeQueue(queueName);
    }

    // Create Dead Letter Queue
    await this.initializeQueue(this.config.dlq.name);

    this.logger.log(`✅ Event Bus initialized with ${this.queues.size} queues`);
  }

  async onModuleDestroy() {
    this.logger.log('🛑 Shutting down Event Bus...');

    // Close all workers
    for (const [, worker] of this.workers) {
      await worker.close();
    }

    // Close all queues
    for (const [, queue] of this.queues) {
      await queue.close();
    }

    await this.redis.disconnect();
    this.logger.log('✅ Event Bus shutdown complete');
  }

  /**
   * Initialize a queue with error handling and monitoring
   */
  private async initializeQueue(queueName: string) {
    const queue = new Queue(queueName, {
      connection: this.config.getRedisConfig(),
    });

    // Setup queue event handlers
    queue.on('error', (error) => {
      this.logger.error(`Queue ${queueName} error:`, error);
    });

    queue.on('failed', async (job, error) => {
      this.logger.error(`Job ${job.id} failed in ${queueName}:`, error);
      await this.handleFailedJob(job, error);
    });

    this.queues.set(queueName, queue);

    // Create worker if we're in a consumer context
    if (process.env.NODE_ENV !== 'test') {
      await this.createWorker(queueName);
    }
  }

  /**
   * Create a worker to process jobs from a queue
   */
  private async createWorker(queueName: string) {
    const worker = new Worker(
      queueName,
      async (job) => {
        this.logger.debug(`Processing job ${job.id} from ${queueName}`);

        try {
          // Emit event for handlers to process
          await this.eventEmitter.emitAsync(`queue:${queueName}`, job.data);
          return { success: true };
        } catch (error) {
          this.logger.error(`Error processing job ${job.id}:`, error);
          throw error;
        }
      },
      {
        connection: this.config.getRedisConfig(),
        concurrency: this.getConcurrency(queueName),
        maxStalledCount: 2,
        lockDuration: 30000,
      },
    );

    worker.on('error', (error) => {
      this.logger.error(`Worker error for ${queueName}:`, error);
    });

    this.workers.set(queueName, worker);
    this.logger.log(`✅ Worker created for queue: ${queueName}`);
  }

  /**
   * Publish a domain event to the appropriate queue
   */
  async publish<T extends DomainEvent>(event: T, options?: PublishOptions) {
    const queueName = eventQueueMapping[event.type] || 'default';
    const queue = this.queues.get(queueName);

    if (!queue) {
      this.logger.error(`Queue ${queueName} not found for event ${event.type}`);
      throw new Error(`Queue ${queueName} not configured`);
    }

    const priority = eventPriorityMapping[event.type] || 5;

    try {
      const job = await queue.add(event.type, event, {
        priority,
        jobId: options?.jobId || `${event.type}:${Date.now()}`,
        attempt: options?.attempt || 1,
        removeOnComplete: options?.removeOnComplete !== false,
        removeOnFail: false,
      });

      this.logger.debug(`📤 Event published: ${event.type} -> ${queueName} (Job: ${job.id})`);

      // Track event metric
      await this.trackEventMetric(event.type, 'published');

      return job;
    } catch (error) {
      this.logger.error(`Failed to publish event ${event.type}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to events from a specific queue
   */
  onQueueEvent<T extends DomainEvent>(
    eventType: string,
    handler: (event: T) => Promise<void>,
  ) {
    this.eventEmitter.on(eventType, handler);
    this.logger.debug(`📥 Handler registered for event: ${eventType}`);
  }

  /**
   * Handle failed job (move to DLQ or retry)
   */
  private async handleFailedJob(job: Job, error: Error) {
    const maxRetries = this.config.dlq.maxRetries;

    if ((job.attemptsMade || 0) < maxRetries) {
      this.logger.log(`Retrying job ${job.id} (attempt ${(job.attemptsMade || 0) + 1}/${maxRetries})`);

      // Exponential backoff retry
      const delay = Math.min(
        this.config.eventRetryPolicy.exponential.baseDelay *
        Math.pow(this.config.eventRetryPolicy.exponential.multiplier, job.attemptsMade || 0),
        this.config.eventRetryPolicy.exponential.maxDelay,
      );

      await job.retry();
    } else {
      // Move to DLQ
      this.logger.error(`Moving job ${job.id} to DLQ after ${maxRetries} retries`);
      await this.moveToDLQ(job, error);
    }
  }

  /**
   * Move job to Dead Letter Queue
   */
  private async moveToDLQ(job: Job, error: Error) {
    const dlq = this.queues.get(this.config.dlq.name);
    if (!dlq) {
      this.logger.error('DLQ not initialized');
      return;
    }

    try {
      await dlq.add(`dlq:${job.name}`, {
        originalJobId: job.id,
        originalData: job.data,
        error: error.message,
        failedAt: new Date(),
      });

      this.logger.error(`Job ${job.id} moved to DLQ`);
      await this.trackEventMetric(job.name, 'dlq');
    } catch (dlqError) {
      this.logger.error('Failed to move job to DLQ:', dlqError);
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName?: string) {
    const stats: Record<string, any> = {};

    const queuesToCheck = queueName
      ? [queueName]
      : Array.from(this.queues.keys());

    for (const name of queuesToCheck) {
      const queue = this.queues.get(name);
      if (queue) {
        stats[name] = {
          active: await queue.getActiveCount(),
          waiting: await queue.getWaitingCount(),
          delayed: await queue.getDelayedCount(),
          completed: await queue.getCompletedCount(),
          failed: await queue.getFailedCount(),
        };
      }
    }

    return stats;
  }

  /**
   * Get job details
   */
  async getJobDetails(queueName: string, jobId: string) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    return {
      id: job.id,
      name: job.name,
      data: job.data,
      progress: job.progress(),
      attempts: job.attemptsMade,
      maxAttempts: job.opts.attempts,
      state: await job.getState(),
      failedReason: job.failedReason,
    };
  }

  /**
   * Retry a failed job from DLQ
   */
  async retryFromDLQ(jobId: string) {
    const dlq = this.queues.get(this.config.dlq.name);
    if (!dlq) {
      throw new Error('DLQ not found');
    }

    const job = await dlq.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found in DLQ`);
    }

    const originalData = job.data.originalData;
    const originalQueueName = eventQueueMapping[originalData.type];

    if (!originalQueueName) {
      throw new Error(`Cannot determine queue for event ${originalData.type}`);
    }

    // Re-publish to original queue
    await this.publish(originalData, { attempt: 1 });

    // Remove from DLQ
    await job.remove();

    this.logger.log(`Job ${jobId} retried from DLQ`);
  }

  /**
   * Track event metrics for monitoring
   */
  private async trackEventMetric(eventType: string, status: 'published' | 'processed' | 'failed' | 'dlq') {
    const key = `metric:events:${eventType}:${status}`;
    await this.redis.incr(key);
    await this.redis.expire(key, 86400); // 24 hours
  }

  /**
   * Batch publish events for bulk operations
   */
  async publishBatch(events: DomainEvent[]) {
    const results = await Promise.allSettled(
      events.map((event) => this.publish(event)),
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    this.logger.log(`📤 Batch publish: ${successful} successful, ${failed} failed`);

    return { successful, failed };
  }

  /**
   * Get concurrency level for a queue based on type
   */
  private getConcurrency(queueName: string): number {
    const concurrencyMap: Record<string, number> = {
      'payments': 10,              // High concurrency for payments
      'notifications': 20,         // High concurrency for notifications
      'video-transcode': 2,        // Low concurrency (CPU intensive)
      'feed-fan-out': 5,           // Moderate concurrency
      'event-tracking': 50,        // High concurrency (fast operations)
      'content-moderation': 3,     // Moderate concurrency
      'vector-embedding': 1,       // Single worker (GPU intensive)
    };

    return concurrencyMap[queueName] || 5;
  }
}

export interface PublishOptions {
  jobId?: string;
  attempt?: number;
  removeOnComplete?: boolean;
  delay?: number;
}
