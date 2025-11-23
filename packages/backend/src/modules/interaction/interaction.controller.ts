import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common'
import { InteractionService } from './interaction.service'

@Controller('interactions')
export class InteractionController {
  constructor(private interactionService: InteractionService) {}

  @Post('reactions')
  async createReaction(
    @Body('postId') postId: string,
    @Body('userId') userId: string,
    @Body('type') type: string,
  ) {
    return this.interactionService.createReaction(postId, userId, type)
  }

  @Get('posts/:postId/reactions')
  async getReactions(@Param('postId') postId: string) {
    return this.interactionService.getReactions(postId)
  }

  @Post('comments')
  async createComment(
    @Body('postId') postId: string,
    @Body('userId') userId: string,
    @Body('content') content: string,
  ) {
    return this.interactionService.createComment(postId, userId, content)
  }

  @Get('posts/:postId/comments')
  async getComments(@Param('postId') postId: string) {
    return this.interactionService.getComments(postId)
  }

  @Post('messages')
  async sendMessage(
    @Body('senderId') senderId: string,
    @Body('recipientId') recipientId: string,
    @Body('content') content: string,
  ) {
    return this.interactionService.sendMessage(senderId, recipientId, content)
  }

  @Get('messages/:userId/:otherUserId')
  async getMessages(@Param('userId') userId: string, @Param('otherUserId') otherUserId: string) {
    return this.interactionService.getMessages(userId, otherUserId)
  }
}
