import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { AuthService } from './auth.service'
import { User } from '@/graphql/types'

@Resolver('Auth')
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation('login')
  async login(@Args('email') email: string, @Args('password') password: string) {
    return this.authService.login({ email, password })
  }

  @Mutation('register')
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('username') username: string,
    @Args('displayName') displayName: string,
  ) {
    return this.authService.register({ email, password, username, displayName })
  }

  @Query('me')
  async me(@Args('userId') userId: string) {
    return this.authService.validateUser(userId)
  }
}
