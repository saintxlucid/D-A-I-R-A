import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

@Injectable()
export class NotificationsService {
  async emitEvent(profileId: string, event: string, payload: any) {
    await redis.publish(`notify:${profileId}`, JSON.stringify({ event, payload }));
  }
}
