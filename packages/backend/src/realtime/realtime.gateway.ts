import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import Redis from 'ioredis';
import { PresenceService } from './presence.service';
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
    const profileId = client.handshake.query.profileId as string;
    await this.presence.setOnline(profileId, client.id);
    // Subscribe to chat/notification channels for this profile
    const profileId = client.handshake.query.profileId as string;
    if (profileId) {
      // If a subscriber already exists for this client and is connected, reuse it
      const existing: Redis | undefined = client.data.redisSub;
      if (existing) {
        if ((existing as any).status === 'ready') return;
        try { existing.disconnect(); } catch (err) { /* ignore */ }
      }
      const sub = new Redis(process.env.REDIS_URL);
      sub.subscribe(`chat:${profileId}`);
      sub.subscribe(`notify:${profileId}`);
      sub.on('message', (channel, message) => {
        try {
          const payload = JSON.parse(message);
          if (channel.startsWith('chat:')) {
            client.emit('chat:received', payload);
          }
          if (channel.startsWith('notify:')) {
            client.emit('notify', payload);
          }
        } catch (err) {
          // ignore bad messages
        }
      });
      client.data.redisSub = sub;
    }
  }

  async handleDisconnect(client: Socket) {
    const profileId = client.handshake.query.profileId as string;
    await this.presence.setOffline(profileId);
    // Cleanup Redis subscriber
    const sub: Redis | undefined = client.data.redisSub;
    if (sub) {
      sub.disconnect();
      client.data.redisSub = undefined;
    }
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
