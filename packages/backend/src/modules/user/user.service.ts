import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/lib/prisma.service'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.profile.findUnique({
      where: { userId },
      include: { user: true, circles: true },
    })
  }

  async updateProfile(userId: string, data: any) {
    return this.prisma.profile.update({
      where: { userId },
      data,
    })
  }

  async createCircle(userId: string, name: string, type: string) {
    return this.prisma.circle.create({
      data: {
        name,
        type,
        ownerId: userId,
      },
    })
  }

  async addCircleMember(circleId: string, userId: string, role: string = 'MEMBER') {
    return this.prisma.circleMember.create({
      data: {
        circleId,
        userId,
        role,
      },
    })
  }

  async getCircles(userId: string) {
    return this.prisma.circle.findMany({
      where: { ownerId: userId },
      include: { members: true },
    })
  }

  async getTrustScore(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { trustScore: true },
    })
    return user?.trustScore || 0
  }
}
