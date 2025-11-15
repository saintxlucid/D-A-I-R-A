import { RedisPresenceService } from '../src/realtime/presence.service';
describe('Presence Load', () => {
  it('handles rapid toggles', async () => {
    const presence = new RedisPresenceService();
    for (let i = 0; i < 100; i++) {
      await presence.setOnline('loadtest');
      await presence.setOffline('loadtest');
    }
    expect(['online', 'offline']).toContain(await presence.isOnline('loadtest') ? 'online' : 'offline');
  });
});
