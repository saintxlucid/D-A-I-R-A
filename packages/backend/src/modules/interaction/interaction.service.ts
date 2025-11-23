import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/lib/prisma.service'

@Injectable()
export class InteractionService {
  constructor(private prisma: PrismaService) {}

  async createReaction(postId: string, userId: string, type: string) {
    return this.prisma.reaction.create({
      data: { postId, userId, type },
    })
  }

  async removeReaction(reactionId: string) {
    return this.prisma.reaction.delete({ where: { id: reactionId } })
  }

  async getReactions(postId: string) {
    return this.prisma.reaction.findMany({
      where: { postId },
      include: { user: true },
    })
  }

  async createComment(postId: string, userId: string, content: string) {
    return this.prisma.comment.create({
      data: { postId, authorId: userId, content },
      include: { author: true },
    })
  }

  async getComments(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      include: { author: true, replies: true },
      orderBy: { createdAt: 'asc' },
    })
  }

  async sendMessage(senderId: string, recipientId: string, content: string) {
    return this.prisma.message.create({
      data: { senderId, recipientId, content },
    })
  }

  async getMessages(userId: string, otherUserId: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    })
  }
}
