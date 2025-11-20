import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

@Injectable()
export class PresenceService {
  // Save presence with socket id and timestamp for multi-device support
  async setOnline(profileId: string, socketId?: string) {
    const payload = JSON.stringify({ status: 'online', socketId, ts: Date.now() });
    await redis.set(`presence:${profileId}`, payload);
  }

  async setOffline(profileId: string) {
    const payload = JSON.stringify({ status: 'offline', ts: Date.now() });
    await redis.set(`presence:${profileId}`, payload);
  }

  async isOnline(profileId: string) {
    const val = await redis.get(`presence:${profileId}`);
    if (!val) return false;
    try {
      const parsed = JSON.parse(val);
      return parsed.status === 'online';
    } catch (err) {
      return val === 'online';
    }
  }

  async getSocketId(profileId: string) {
    const val = await redis.get(`presence:${profileId}`);
    if (!val) return null;
    try {
      const parsed = JSON.parse(val);
      return parsed.socketId ?? null;
    } catch (err) {
      return null;
    }
  }
}
