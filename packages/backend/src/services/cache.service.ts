import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    if (!cached) return null;
    return JSON.parse(cached) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  // Cache for feed data
  async cacheFeed(userId: string, page: number, pageSize: number, data: unknown) {
    const cacheKey = `feed:${userId}:${page}:${pageSize}`;
    await this.set(cacheKey, data, 60); // 1 minute cache
  }

  async getCachedFeed(userId: string, page: number, pageSize: number) {
    const cacheKey = `feed:${userId}:${page}:${pageSize}`;
    return this.get(cacheKey);
  }

  async invalidateFeed(userId: string) {
    await this.deletePattern(`feed:${userId}:*`);
  }

  // Cache for user profiles
  async cacheUserProfile(userId: string, data: unknown) {
    const cacheKey = `user:${userId}`;
    await this.set(cacheKey, data, 300); // 5 minute cache
  }

  async getCachedUserProfile(userId: string) {
    const cacheKey = `user:${userId}`;
    return this.get(cacheKey);
  }

  async invalidateUserProfile(userId: string) {
    await this.delete(`user:${userId}`);
  }

  // Cache for trending posts
  async cacheTrendingPosts(data: unknown) {
    const cacheKey = 'trending:posts';
    await this.set(cacheKey, data, 600); // 10 minute cache
  }

  async getCachedTrendingPosts() {
    const cacheKey = 'trending:posts';
    return this.get(cacheKey);
  }

  async invalidateTrendingPosts() {
    await this.delete('trending:posts');
  }
}
