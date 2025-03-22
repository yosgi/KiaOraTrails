import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { PostsService } from './posts.service';
import { POST_TYPE } from '../entities/post.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getAllPosts() {
    return this.postsService.getAllPosts();
  }

  @Post('create')
  createPost(
    @Body('type') type: POST_TYPE,
    @Body('title') title: string | null,
    @Body('description') description: string | null,
    @Body('location') location: string | null,
    @Body('photos') photos: string[] | null,
    @Body('user_id') user_id: string | null,
    @Body('fund') fund: number | null,
  ) {
    const post = {
      ...(title && { title }),
      ...(description && { description }),
      ...(location && { location }),
      ...(photos && { photos }),
      ...(user_id && { user_id }),
      ...(fund && { fund }),
      type,
    };
    console.log('post', post);
    return this.postsService.createPost(post);
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
