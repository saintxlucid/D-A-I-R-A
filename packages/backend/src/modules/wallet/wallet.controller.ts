import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { WalletService } from './wallet.service'

@Controller('wallets')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get(':userId')
  async getWallet(@Param('userId') userId: string) {
    return this.walletService.getWallet(userId)
  }

  @Post(':userId/payment-methods')
  async addPaymentMethod(@Param('userId') userId: string, @Body() data: any) {
    return this.walletService.addPaymentMethod(userId, data.type, data)
  }

  @Post('tips')
  async sendTip(
    @Body('senderId') senderId: string,
    @Body('recipientId') recipientId: string,
    @Body('amount') amount: number,
  ) {
    return this.walletService.sendTip(senderId, recipientId, amount)
  }

  @Post(':userId/transactions')
  async createTransaction(
    @Param('userId') userId: string,
    @Body('type') type: string,
    @Body('amount') amount: number,
  ) {
    return this.walletService.createTransaction(userId, type, amount)
  }

  @Post(':creatorId/metrics')
  async getCreatorMetrics(@Param('creatorId') creatorId: string) {
    return this.walletService.getCreatorMetrics(creatorId)
  }
}
