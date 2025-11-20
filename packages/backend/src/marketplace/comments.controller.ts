import { Controller, Post, Req, Body, UseGuards, Get, Param } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../../guards/jwt.guard';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() body: { postId: string; content: string }) {
    return this.commentsService.create(req.user.id, body.postId, body.content);
  }

  @Get(':postId')
  list(@Param('postId') postId: string) {
    return this.commentsService.listForPost(postId);
  }
}
