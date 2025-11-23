import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventBusService } from './services/event-bus.service';
import { RealtimeEventHub } from './services/realtime-event-hub.service';
import { EventBusConfig } from './config/event-bus.config';
import { RequestResponseMiddleware, RequestContextService } from './middleware/request-response.middleware';
import { EventHandlerService } from './handlers/event-handler.service';

/**
 * Circulatory & Connective Systems Module
 *
 * Provides the core communication infrastructure for D-A-I-R-A:
 * - Event bus (async job processing via BullMQ)
 * - Real-time events (Redis pub/sub)
 * - Request/response tracking
 * - Event handlers
 */
@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: ':',
      maxListeners: 10,
      verboseMemoryLeak: true,
    }),
  ],
  providers: [
    EventBusConfig,
    EventBusService,
    RealtimeEventHub,
    RequestContextService,
    RequestResponseMiddleware,
    EventHandlerService,
  ],
  exports: [
    EventBusService,
    RealtimeEventHub,
    RequestContextService,
    EventBusConfig,
  ],
})
export class CirculatoryModule {}
