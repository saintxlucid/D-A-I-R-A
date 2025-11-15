import { RealtimeGateway } from '../src/realtime/realtime.gateway';
import { RedisPresenceService } from '../src/realtime/presence.service';
import { ChatService } from '../src/realtime/chat.service';
import { NotificationsService } from '../src/realtime/notifications.service';
describe('RealtimeGateway', () => {
  it('toggles presence on connect/disconnect', async () => {
    const presence = new RedisPresenceService();
    const chat = new ChatService();
    const notifications = new NotificationsService();
    const gateway = new RealtimeGateway(presence, chat, notifications);
    const mockClient = { handshake: { query: { profileId: 'abc' } } } as any;
    await gateway.handleConnection(mockClient);
    expect(await presence.isOnline('abc')).toBe(true);
    await gateway.handleDisconnect(mockClient);
    expect(await presence.isOnline('abc')).toBe(false);
  });
});
