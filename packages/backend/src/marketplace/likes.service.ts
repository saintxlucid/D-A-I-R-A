import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class LikesService {
  async toggleLike(userId: string, postId: string) {
    const existing = await prisma.like.findFirst({ where: { userId, postId } });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return { liked: false };
    }
    await prisma.like.create({ data: { userId, postId } });
    return { liked: true };
  }

  async countForPost(postId: string) {
    return prisma.like.count({ where: { postId } });
  }
}
