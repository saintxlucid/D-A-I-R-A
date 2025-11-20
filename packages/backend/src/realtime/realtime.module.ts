import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { ChatService } from './chat.service';
import { NotificationsService } from './notifications.service';
import { PresenceService } from './presence.service';

@Module({
  providers: [RealtimeGateway, ChatService, NotificationsService, PresenceService],
})
export class RealtimeModule {}
