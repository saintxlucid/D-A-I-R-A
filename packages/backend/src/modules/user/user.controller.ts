import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { UserService } from './user.service'

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':userId/profile')
  async getProfile(@Param('userId') userId: string) {
    return this.userService.getProfile(userId)
  }

  @Get(':userId/circles')
  async getCircles(@Param('userId') userId: string) {
    return this.userService.getCircles(userId)
  }

  @Post(':userId/circles')
  async createCircle(
    @Param('userId') userId: string,
    @Body('name') name: string,
    @Body('type') type: string,
  ) {
    return this.userService.createCircle(userId, name, type)
  }

  @Get(':userId/trust-score')
  async getTrustScore(@Param('userId') userId: string) {
    return this.userService.getTrustScore(userId)
  }
}
