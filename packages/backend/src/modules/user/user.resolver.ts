import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UserService } from './user.service'

@Resolver('User')
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query('profile')
  async getProfile(@Args('userId') userId: string) {
    return this.userService.getProfile(userId)
  }

  @Mutation('updateProfile')
  async updateProfile(@Args('userId') userId: string, @Args('data') data: any) {
    return this.userService.updateProfile(userId, data)
  }

  @Mutation('createCircle')
  async createCircle(
    @Args('userId') userId: string,
    @Args('name') name: string,
    @Args('type') type: string,
  ) {
    return this.userService.createCircle(userId, name, type)
  }

  @Query('circles')
  async getCircles(@Args('userId') userId: string) {
    return this.userService.getCircles(userId)
  }

  @Query('trustScore')
  async getTrustScore(@Args('userId') userId: string) {
    return this.userService.getTrustScore(userId)
  }
}
