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

    const res = await agent
      .post('/auth/signup')
      .send({ email: 'test@example.com', password: 'password' });
    expect(res.body).toEqual({ id: '1', email: 'test@example.com' });

    const login = await agent
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    expect(login.body.accessToken).toBeDefined();

    const refresh = await agent.post('/auth/refresh');
    expect(refresh.body.accessToken).toBeDefined();
  });
  afterAll(async () => {
    await app.close();
  });
});
