import { Controller, Post, Req, Body, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../../guards/jwt.guard';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('toggle')
  @UseGuards(JwtAuthGuard)
  toggle(@Req() req: any, @Body() body: { postId: string }) {
    return this.likesService.toggleLike(req.user.id, body.postId);
  }
}
