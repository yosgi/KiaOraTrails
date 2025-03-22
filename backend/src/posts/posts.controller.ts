import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getAllPosts() {
    return this.postsService.getAllPosts();
  }

  @Post('create')
  createPost(
    @Body('title') title: string,
    @Body('content') content: string,
    @Body('userId') userId: number,
  ) {
    return this.postsService.createPost(title, content, userId);
  }

  @Patch(':postId/vote')
  votePost(@Param('postId') postId: number) {
    return this.postsService.votePost(postId);
  }

  @Patch(':postId/assign/:assigneeId')
  assignPost(
    @Param('postId') postId: number,
    @Param('assigneeId') assigneeId: number,
  ) {
    return this.postsService.assignPost(postId, assigneeId);
  }

  @Patch(':postId/complete')
  completePost(@Param('postId') postId: number) {
    return this.postsService.completePost(postId);
  }

  @Patch(':postId/review')
  reviewPost(
    @Param('postId') postId: number,
    @Body('userId') userId: number,
    @Body('score') score: number,
  ) {
    return this.postsService.reviewPost(postId, userId, score);
  }
}
