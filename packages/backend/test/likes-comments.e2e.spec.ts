import request from 'supertest';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/modules/app.module';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Likes & Comments E2E', () => {
  let app;
  let userId, token, post;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule);
    await app.init();

    const agent = request.agent(app.getHttpServer());
    const sign = await agent.post('/auth/signup').send({ email: 'likes@example.com', password: 'pass' });
    userId = sign.body.id;
    const login = await agent.post('/auth/login').send({ email: 'likes@example.com', password: 'pass' });
    token = login.body.accessToken;

    const p = await agent.post('/posts').set('Authorization', `Bearer ${token}`).send({ content: 'Post for likes' });
    post = p.body;
  });

  it('should like/unlike and comment on post', async () => {
    const agent = request.agent(app.getHttpServer());
    // like
    const likeRes = await agent.post('/likes/toggle').set('Authorization', `Bearer ${token}`).send({ postId: post.id });
    expect(likeRes.body.liked).toBe(true);

    // toggle unlike
    const likeRes2 = await agent.post('/likes/toggle').set('Authorization', `Bearer ${token}`).send({ postId: post.id });
    expect(likeRes2.body.liked).toBe(false);

    // comment
    const commentRes = await agent.post('/comments').set('Authorization', `Bearer ${token}`).send({ postId: post.id, content: 'Nice!' });
    expect(commentRes.body.id).toBeDefined();

    const list = await agent.get(`/comments/${post.id}`);
    expect(list.status).toBe(200);
    expect(list.body.length).toBeGreaterThan(0);
  });

  afterAll(async () => {
    await prisma.comment.deleteMany({ where: { postId: post.id } });
    await prisma.like.deleteMany({ where: { postId: post.id } });
    await prisma.post.delete({ where: { id: post.id } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
    await app.close();
  });
});
