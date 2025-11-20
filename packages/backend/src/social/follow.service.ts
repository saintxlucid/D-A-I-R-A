import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class FollowService {
  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) throw new NotFoundException("Can't follow yourself");
    return prisma.follow.create({ data: { followerId, followingId } });
  }

  async unfollow(followerId: string, followingId: string) {
    await prisma.follow.deleteMany({ where: { followerId, followingId } });
    return { success: true };
  }

  async getFollowedIds(userId: string) {
    const rows = await prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } });
    return rows.map(r => r.followingId);
  }

  async getFeed(userId: string, page = 0, limit = 20) {
    const followed = await this.getFollowedIds(userId);
    return prisma.post.findMany({ where: { authorId: { in: followed } }, orderBy: { createdAt: 'desc' }, skip: page * limit, take: limit, include: { media: true } });
  }
}
