import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { InteractionService } from './interaction.service'

@Resolver('Interaction')
export class InteractionResolver {
  constructor(private interactionService: InteractionService) {}

  @Mutation('createReaction')
  async createReaction(
    @Args('postId') postId: string,
    @Args('userId') userId: string,
    @Args('type') type: string,
  ) {
    return this.interactionService.createReaction(postId, userId, type)
  }

  @Query('reactions')
  async getReactions(@Args('postId') postId: string) {
    return this.interactionService.getReactions(postId)
  }

  @Mutation('createComment')
  async createComment(
    @Args('postId') postId: string,
    @Args('userId') userId: string,
    @Args('content') content: string,
  ) {
    return this.interactionService.createComment(postId, userId, content)
  }

  @Query('comments')
  async getComments(@Args('postId') postId: string) {
    return this.interactionService.getComments(postId)
  }
}
