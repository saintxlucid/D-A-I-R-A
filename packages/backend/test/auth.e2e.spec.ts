import request from 'supertest';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/modules/app.module';

describe('Auth E2E', () => {
  let app;
  beforeAll(async () => {
    app = await NestFactory.create(AppModule);
    await app.init();
  });
  it('POST /auth/signup, login, refresh', async () => {
    const agent = request.agent(app.getHttpServer());

    const res = await agent.post('/auth/signup').send({ email: 'test@example.com', password: 'password' });
    expect(res.body.email).toBe('test@example.com');
    expect(res.body.id).toBeDefined();

    const login = await agent
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    expect(login.body.accessToken).toBeDefined();

    const refresh = await agent.post('/auth/refresh');
    expect(refresh.body.accessToken).toBeDefined();
    
    // Logout should clear the session and refresh should fail
    await agent.post('/auth/logout');
    const refresh2 = await agent.post('/auth/refresh');
    expect(refresh2.status).toBe(401);
  });
  afterAll(async () => {
    await app.close();
  });
});
