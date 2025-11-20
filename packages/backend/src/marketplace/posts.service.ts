import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class PostsService {
  async findAll() {
    return prisma.post.findMany({ include: { media: true } });
  }

  async findOne(id: string) {
    return prisma.post.findUnique({ where: { id }, include: { media: true } });
  }

  async create(createPostDto: any) {
    const data: any = {
      content: createPostDto.content,
      author: { connect: { id: createPostDto.authorId } },
    };
    if (createPostDto.media && createPostDto.media.length) {
      data.media = { create: createPostDto.media };
    }
    return prisma.post.create({ data, include: { media: true } });
  }

  async update(id: string, updatePostDto: any) {
    const data: any = {};
    if (updatePostDto.content) data.content = updatePostDto.content;
    if (updatePostDto.media && updatePostDto.media.length) {
      data.media = { create: updatePostDto.media };
    }
    return prisma.post.update({ where: { id }, data, include: { media: true } });
  }

  async remove(id: string) {
    return prisma.post.delete({ where: { id } });
  }
}
