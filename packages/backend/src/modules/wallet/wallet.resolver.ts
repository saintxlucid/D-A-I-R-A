import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { WalletService } from './wallet.service'

@Resolver('Wallet')
export class WalletResolver {
  constructor(private walletService: WalletService) {}

  @Query('wallet')
  async getWallet(@Args('userId') userId: string) {
    return this.walletService.getWallet(userId)
  }

  @Mutation('sendTip')
  async sendTip(
    @Args('senderId') senderId: string,
    @Args('recipientId') recipientId: string,
    @Args('amount') amount: number,
  ) {
    return this.walletService.sendTip(senderId, recipientId, amount)
  }

  @Mutation('subscribe')
  async subscribeToCreator(
    @Args('subscriberId') subscriberId: string,
    @Args('creatorId') creatorId: string,
    @Args('tier') tier: string,
  ) {
    return this.walletService.subscribeToCreator(subscriberId, creatorId, tier)
  }

  @Query('creatorMetrics')
  async getCreatorMetrics(@Args('creatorId') creatorId: string) {
    return this.walletService.getCreatorMetrics(creatorId)
  }
}
