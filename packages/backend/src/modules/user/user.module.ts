import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserResolver } from './user.resolver'
import { UserController } from './user.controller'
import { PrismaService } from '@/lib/prisma.service'

@Module({
  providers: [UserService, UserResolver, PrismaService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
