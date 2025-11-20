import { Controller, Post, Req, Body, Get, Query, UseGuards } from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtAuthGuard } from '../guards/jwt.guard';

@Controller('social')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('follow')
  @UseGuards(JwtAuthGuard)
  follow(@Req() req: any, @Body() body: { followingId: string }) {
    return this.followService.follow(req.user.id, body.followingId);
  }

  @Post('unfollow')
  @UseGuards(JwtAuthGuard)
  unfollow(@Req() req: any, @Body() body: { followingId: string }) {
    return this.followService.unfollow(req.user.id, body.followingId);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  feed(@Req() req: any, @Query('page') page = '0', @Query('limit') limit = '20') {
    return this.followService.getFeed(req.user.id, Number(page), Number(limit));
  }
}
