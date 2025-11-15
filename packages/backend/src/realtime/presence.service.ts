import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

@Injectable()
export class RedisPresenceService {
  async setOnline(profileId: string) {
    await redis.set(`presence:${profileId}`, 'online');
  }
  async setOffline(profileId: string) {
    await redis.set(`presence:${profileId}`, 'offline');
  }
  async isOnline(profileId: string) {
    return (await redis.get(`presence:${profileId}`)) === 'online';
  }
}
