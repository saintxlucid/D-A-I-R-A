import { Module } from '@nestjs/common'
import { InteractionService } from './interaction.service'
import { InteractionResolver } from './interaction.resolver'
import { InteractionController } from './interaction.controller'
import { PrismaService } from '@/lib/prisma.service'

@Module({
  providers: [InteractionService, InteractionResolver, PrismaService],
  controllers: [InteractionController],
  exports: [InteractionService],
})
export class InteractionModule {}
