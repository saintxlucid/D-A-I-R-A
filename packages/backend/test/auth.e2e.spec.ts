import request from 'supertest';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/modules/app.module';

describe('Auth E2E', () => {
  let app;
  beforeAll(async () => {
    app = await NestFactory.create(AppModule);
    await app.init();
  });
  it('POST /auth/signup', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'test@example.com', password: 'password' });
    expect(res.body).toEqual({ id: '1', email: 'test@example.com' });
  });
  afterAll(async () => {
    await app.close();
  });
});
