import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { EventBusConfig } from '../config/event-bus.config';
import { DomainEvent } from './event.types';

/**
 * Real-Time Event Hub (Pub/Sub Layer)
 *
 * Handles real-time communication using Redis pub/sub:
 * - User presence (online/offline)
 * - Typing indicators
 * - Real-time notifications
 * - Chat messaging
 * - Live feed updates
 */
@Injectable()
export class RealtimeEventHub {
  private readonly logger = new Logger(RealtimeEventHub.name);
  private redis: Redis;
  private subscriber: Redis;
  private handlers: Map<string, Set<(data: any) => void>> = new Map();

  constructor(private config: EventBusConfig) {
    this.redis = new Redis(this.config.getRedisConfig());
    this.subscriber = new Redis(this.config.getRedisConfig());
  }

  async onModuleInit() {
    this.logger.log('🚀 Initializing Real-Time Event Hub...');

    // Setup pub/sub listeners
    this.subscriber.on('message', (channel, message) => {
      this.handleMessage(channel, JSON.parse(message));
    });

    this.logger.log('✅ Real-Time Event Hub initialized');
  }

  /**
   * Publish to a channel (one-way broadcast)
   */
  async publish(channel: string, data: any) {
    try {
      await this.redis.publish(channel, JSON.stringify(data));
      this.logger.debug(`📤 Published to ${channel}`);
    } catch (error) {
      this.logger.error(`Failed to publish to ${channel}:`, error);
    }
  }

  /**
   * Subscribe to a channel
   */
  async subscribe(channel: string, handler: (data: any) => void) {
    // Register local handler
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());

      // Subscribe in Redis
      await this.subscriber.subscribe(channel, (error) => {
        if (error) {
          this.logger.error(`Failed to subscribe to ${channel}:`, error);
        } else {
          this.logger.debug(`📥 Subscribed to ${channel}`);
        }
      });
    }

    this.handlers.get(channel).add(handler);
  }

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channel: string, handler?: (data: any) => void) {
    if (handler) {
      this.handlers.get(channel)?.delete(handler);
    } else {
      this.handlers.delete(channel);
    }

    if (!this.handlers.has(channel) || this.handlers.get(channel)?.size === 0) {
      await this.subscriber.unsubscribe(channel);
      this.logger.debug(`📭 Unsubscribed from ${channel}`);
    }
  }

  /**
   * Handle incoming pub/sub messages
   */
  private handleMessage(channel: string, data: any) {
    const handlers = this.handlers.get(channel);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          this.logger.error(`Error in handler for ${channel}:`, error);
        }
      });
    }
  }

  /**
   * Publish user online status
   */
  async publishUserOnline(userId: string, socketId?: string) {
    const channel = this.config.pubSubChannels.userOnline;

    await Promise.all([
      this.redis.setex(`user:online:${userId}`, 3600, JSON.stringify({ socketId, timestamp: Date.now() })),
      this.publish(channel, { userId, socketId, timestamp: Date.now() }),
    ]);

    this.logger.debug(`👤 User ${userId} online`);
  }

  /**
   * Publish user offline status
   */
  async publishUserOffline(userId: string) {
    const channel = this.config.pubSubChannels.userOffline;

    await Promise.all([
      this.redis.del(`user:online:${userId}`),
      this.publish(channel, { userId, timestamp: Date.now() }),
    ]);

    this.logger.debug(`👤 User ${userId} offline`);
  }

  /**
   * Publish typing indicator
   */
  async publishTypingIndicator(userId: string, recipientId: string, isTyping: boolean) {
    const channel = this.config.pubSubChannels.userTyping.replace('*', recipientId);

    await this.publish(channel, {
      userId,
      recipientId,
      isTyping,
      timestamp: Date.now(),
    });

    this.logger.debug(`⌨️  User ${userId} ${isTyping ? 'typing' : 'stopped typing'} for ${recipientId}`);
  }

  /**
   * Broadcast a new post to followers
   */
  async broadcastPostCreated(postId: string, authorId: string, followers: string[]) {
    const tasks = followers.map((followerId) => {
      const channel = `feed:${followerId}`;
      return this.publish(channel, {
        type: 'POST_CREATED',
        postId,
        authorId,
        timestamp: Date.now(),
      });
    });

    await Promise.all(tasks);
    this.logger.debug(`📢 Post ${postId} broadcast to ${followers.length} followers`);
  }

  /**
   * Broadcast a notification
   */
  async broadcastNotification(userId: string, notification: any) {
    const channel = `notifications:${userId}`;
    await this.publish(channel, notification);
    this.logger.debug(`🔔 Notification sent to ${userId}`);
  }

  /**
   * Get user online status
   */
  async getUserOnlineStatus(userId: string): Promise<boolean> {
    const status = await this.redis.exists(`user:online:${userId}`);
    return status === 1;
  }

  /**
   * Get all online users in a room/context
   */
  async getOnlineUsers(pattern: string = 'user:online:*'): Promise<string[]> {
    const keys = await this.redis.keys(pattern);
    const userIds = keys
      .map((key) => key.replace('user:online:', ''))
      .filter((id) => id);

    return userIds;
  }

  /**
   * Pattern subscribe (for dynamic channels)
   */
  async psubscribe(pattern: string, handler: (data: any) => void) {
    const key = `psubscribe:${pattern}`;

    if (!this.handlers.has(key)) {
      this.handlers.set(key, new Set());
      await this.subscriber.psubscribe(pattern, (error) => {
        if (error) {
          this.logger.error(`Failed to psubscribe to ${pattern}:`, error);
        } else {
          this.logger.debug(`📥 Pattern subscribed to ${pattern}`);
        }
      });
    }

    this.handlers.get(key).add(handler);
  }

  /**
   * Clean up old user online status (for users who disconnected ungracefully)
   */
  async cleanupStaleOnlineStatus() {
    const keys = await this.redis.keys('user:online:*');
    this.logger.debug(`Checking ${keys.length} online statuses for staleness`);

    // Redis will auto-expire via TTL, this is just a safety check
  }
}
