import { Module } from '@nestjs/common'
import { WalletService } from './wallet.service'
import { WalletResolver } from './wallet.resolver'
import { WalletController } from './wallet.controller'
import { PrismaService } from '@/lib/prisma.service'

@Module({
  providers: [WalletService, WalletResolver, PrismaService],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {}
