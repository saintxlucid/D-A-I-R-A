import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { v4 as uuid } from 'uuid';
import { EventBusConfig } from '../config/event-bus.config';

/**
 * Request/Response Middleware
 *
 * Adds communication metadata to every request:
 * - Request ID (for distributed tracing)
 * - Correlation ID (for request chains)
 * - Timing information
 * - Request/response logging
 */
@Injectable()
export class RequestResponseMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestResponseMiddleware.name);
  private redis: Redis;

  constructor(private config: EventBusConfig) {
    this.redis = new Redis(this.config.getRedisConfig());
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Generate correlation ID for request chain tracing
    const correlationId = req.get('x-correlation-id') || uuid();
    const requestId = uuid();
    const startTime = Date.now();

    // Attach to request context
    (req as any).correlationId = correlationId;
    (req as any).requestId = requestId;
    (req as any).startTime = startTime;

    // Add to response headers
    res.setHeader('x-correlation-id', correlationId);
    res.setHeader('x-request-id', requestId);

    // Intercept response.json() to log response
    const originalJson = res.json.bind(res);
    res.json = (data: any) => {
      const duration = Date.now() - startTime;
      const status = res.statusCode;

      this.logRequest(req, status, duration, correlationId, requestId);

      return originalJson(data);
    };

    // Log timing on response finish
    res.on('finish', () => {
      const duration = Date.now() - startTime;

      // Store request metrics
      this.storeMetrics(req.method, req.path, res.statusCode, duration);
    });

    next();
  }

  private logRequest(
    req: Request,
    status: number,
    duration: number,
    correlationId: string,
    requestId: string,
  ) {
    const method = req.method;
    const path = req.path;
    const statusEmoji = status >= 400 ? '❌' : status >= 300 ? '↩️' : '✅';

    this.logger.log(
      `${statusEmoji} ${method} ${path} - ${status} (${duration}ms) [${correlationId}]`,
    );
  }

  private async storeMetrics(method: string, path: string, status: number, duration: number) {
    const metricsKey = `metrics:${method}:${path}`;

    // Store request count
    await this.redis.incr(`${metricsKey}:count`);

    // Store duration for P95 calculation
    await this.redis.lpush(`${metricsKey}:durations`, duration.toString());
    await this.redis.ltrim(`${metricsKey}:durations`, 0, 99); // Keep last 100

    // Store status code breakdown
    await this.redis.incr(`${metricsKey}:${status}`);

    // Expire metrics after 1 hour
    await this.redis.expire(metricsKey, 3600);
  }
}

/**
 * Request Context Decorator
 *
 * Provides access to request metadata from any service
 */
export interface RequestContext {
  correlationId: string;
  requestId: string;
  userId?: string;
  method: string;
  path: string;
}

@Injectable()
export class RequestContextService {
  constructor(private redis: Redis) {}

  async getContext(request: Request): Promise<RequestContext> {
    return {
      correlationId: (request as any).correlationId,
      requestId: (request as any).requestId,
      userId: (request as any).user?.id,
      method: request.method,
      path: request.path,
    };
  }

  async storeContext(context: RequestContext) {
    const key = `context:${context.requestId}`;
    await this.redis.setex(key, 3600, JSON.stringify(context)); // 1 hour TTL
  }

  async getContextByRequestId(requestId: string): Promise<RequestContext | null> {
    const data = await this.redis.get(`context:${requestId}`);
    return data ? JSON.parse(data) : null;
  }
}
