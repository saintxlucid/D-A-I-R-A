import request from 'supertest';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/modules/app.module';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Follow & Feed E2E', () => {
  let app;
  let userA, userB, tokenA, tokenB;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule);
    await app.init();

    const agent = request.agent(app.getHttpServer());
    const signA = await agent.post('/auth/signup').send({ email: 'followA@example.com', password: 'passA' });
    userA = signA.body.id;
    const loginA = await agent.post('/auth/login').send({ email: 'followA@example.com', password: 'passA' });
    tokenA = loginA.body.accessToken;

    const signB = await agent.post('/auth/signup').send({ email: 'followB@example.com', password: 'passB' });
    userB = signB.body.id;
    const loginB = await agent.post('/auth/login').send({ email: 'followB@example.com', password: 'passB' });
    tokenB = loginB.body.accessToken;
  });

  it('userA follows userB and sees their post in feed', async () => {
    const agent = request.agent(app.getHttpServer());
    // A follows B
    await agent.post('/social/follow').set('Authorization', `Bearer ${tokenA}`).send({ followingId: userB });
    // B creates a post
    await agent.post('/posts').set('Authorization', `Bearer ${tokenB}`).send({ content: 'B post' });
    // A fetches feed
    const feed = await agent.get('/social/feed').set('Authorization', `Bearer ${tokenA}`);
    expect(feed.status).toBe(200);
    expect(feed.body.find((p: any) => p.content === 'B post')).toBeTruthy();
  });

  afterAll(async () => {
    await prisma.post.deleteMany({ where: { authorId: { in: [userA, userB] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userA, userB] } } });
    await prisma.follow.deleteMany({ where: {} });
    await prisma.$disconnect();
    await app.close();
  });
});
