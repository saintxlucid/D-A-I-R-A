import { AuthService } from '../src/services/auth.service';
describe('AuthService', () => {
  it('should signup a user', async () => {
    const service = new AuthService();
    const user = await service.signup('test@example.com', 'password');
    expect(user).toEqual({ id: '1', email: 'test@example.com' });
  });
});
