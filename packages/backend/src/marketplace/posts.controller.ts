import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt.guard';
import { CreatePostDto, UpdatePostDto } from './dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() createPostDto: CreatePostDto) {
    // force author from JWT
    createPostDto.authorId = req.user.id;
    return this.postsService.create(createPostDto);
  }

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  update(@Req() req: any, @Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    // Optional: verify ownership (skip for now)
    return this.postsService.update(id, updatePostDto);
  }

  @Post(':id/delete')
  @UseGuards(JwtAuthGuard)
  remove(@Req() req: any, @Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
