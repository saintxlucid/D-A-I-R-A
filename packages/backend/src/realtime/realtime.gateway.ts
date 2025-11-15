import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { RedisPresenceService } from './presence.service';
import { ChatService } from './chat.service';
import { NotificationsService } from './notifications.service';
import { Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/ws', transports: ['websocket'] })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly presence: RedisPresenceService,
    private readonly chat: ChatService,
    private readonly notifications: NotificationsService,
  ) {}

  async handleConnection(client: Socket) {
    await this.presence.setOnline(client.handshake.query.profileId as string);
  }

  async handleDisconnect(client: Socket) {
    await this.presence.setOffline(client.handshake.query.profileId as string);
  }

  @SubscribeMessage('chat:send')
  async handleChat(@MessageBody() data: { to: string; message: string }, @ConnectedSocket() client: Socket) {
    return this.chat.sendMessage(client.handshake.query.profileId as string, data.to, data.message);
  }

  @SubscribeMessage('presence:query')
  async handlePresence(@MessageBody() data: { profileId: string }) {
    return this.presence.isOnline(data.profileId);
  }
}
