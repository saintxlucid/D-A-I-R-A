import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/lib/prisma.service'

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getWallet(userId: string) {
    return this.prisma.wallet.findUnique({
      where: { userId },
      include: { paymentMethods: true, transactions: true },
    })
  }

  async createWallet(userId: string) {
    return this.prisma.wallet.create({
      data: { userId, creditBalance: 0, cashBalance: 0 },
    })
  }

  async addPaymentMethod(userId: string, type: string, data: any) {
    return this.prisma.paymentMethod.create({
      data: { userId, type, ...data },
    })
  }

  async sendTip(senderId: string, recipientId: string, amount: number) {
    return this.prisma.tip.create({
      data: { senderId, recipientId, amount },
    })
  }

  async createTransaction(userId: string, type: string, amount: number) {
    return this.prisma.transaction.create({
      data: { userId, type, amount },
    })
  }

  async subscribeToCreator(subscriberId: string, creatorId: string, tier: string) {
    return this.prisma.creatorSubscription.create({
      data: { subscriberId, creatorId, tier, status: 'ACTIVE' },
    })
  }

  async getCreatorMetrics(creatorId: string) {
    return this.prisma.creatorMetrics.findUnique({
      where: { creatorId },
    })
  }
}
