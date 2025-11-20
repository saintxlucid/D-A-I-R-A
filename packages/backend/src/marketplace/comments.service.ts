import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class CommentsService {
  async create(authorId: string, postId: string, content: string) {
    return prisma.comment.create({ data: { authorId, postId, content } });
  }

  async listForPost(postId: string) {
    return prisma.comment.findMany({ where: { postId }, orderBy: { createdAt: 'asc' } });
  }
}
