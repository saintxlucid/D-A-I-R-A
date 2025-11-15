import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

@Injectable()
export class ChatService {
  async sendMessage(from: string, to: string, message: string) {
    const chatKey = `chat:${from}:${to}`;
    await redis.rpush(chatKey, JSON.stringify({ from, to, message, timestamp: Date.now() }));
    // Pub/sub for real-time delivery
    await redis.publish(`chat:${to}`, JSON.stringify({ from, message }));
    return { success: true };
  }
}
