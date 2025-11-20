import request from 'supertest';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/modules/app.module';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Posts E2E', () => {
  let app;
  let userId: string;
  let token: string;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule);
    await app.init();

    // Create and login a test user via API
    const agent = request.agent(app.getHttpServer());
    const sign = await agent.post('/auth/signup').send({ email: 'posttest@example.com', password: 'secret' });
    userId = sign.body.id;
    const login = await agent.post('/auth/login').send({ email: 'posttest@example.com', password: 'secret' });
    expect(login.body.accessToken).toBeDefined();
    token = login.body.accessToken;
  });

  it('should create and fetch posts', async () => {
    const agent = request.agent(app.getHttpServer());

    const res = await agent.post('/posts').set('Authorization', `Bearer ${token}`).send({ content: 'Hello from tests' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.content).toBe('Hello from tests');

    const list = await agent.get('/posts');
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBeTruthy();
    expect(list.body.find((p: any) => p.id === res.body.id)).toBeTruthy();

    // Verify that creating a post without authentication is forbidden
    const bad = await agent.post('/posts').send({ content: 'should fail' });
    expect(bad.status).toBe(401);
  });

  afterAll(async () => {
    await prisma.post.deleteMany({ where: { authorId: userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
    await app.close();
  });
});
