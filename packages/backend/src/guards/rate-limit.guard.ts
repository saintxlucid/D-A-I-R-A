import {
  Injectable,
  CanActivate,
  ExecutionContext,
  TooManyRequestsException,
  Inject,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.ip;

    // Different limits for different endpoints
    const endpoint = request.route.path;
    const method = request.method;
    const routeKey = `${method}:${endpoint}`;

    const limits: Record<string, { max: number; windowMs: number }> = {
      'POST:/api/auth/login': { max: 10, windowMs: 900 }, // 10 per 15 min
      'POST:/api/auth/signup': { max: 5, windowMs: 3600 }, // 5 per hour
      'POST:/api/auth/forgot-password': { max: 3, windowMs: 3600 }, // 3 per hour
      'POST:/api/posts': { max: 100, windowMs: 60 }, // 100 per minute
      'POST:/api/posts/:id/like': { max: 200, windowMs: 60 }, // 200 per minute
      'POST:/api/posts/:id/comments': { max: 50, windowMs: 60 }, // 50 per minute
      default: { max: 100, windowMs: 60 },
    };

    const limit = limits[routeKey] || limits['default'];
    const key = `rate-limit:${userId}:${routeKey}`;

    const count = await this.redis.incr(key);

    if (count === 1) {
      // First request, set expiry
      await this.redis.expire(key, limit.windowMs);
    }

    if (count > limit.max) {
      throw new TooManyRequestsException(
        `Too many requests. Max ${limit.max} per ${limit.windowMs}s`,
      );
    }

    return true;
  }
}
