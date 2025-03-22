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

  @Get(':postId')
  getPost(@Param('postId') postId: number) {
    return this.postsService.getPostById(postId);
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
      created_at: new Date(),
    };
    console.log('post', post);
    return this.postsService.createPost(post);
  }

  @Post(':postId/vote')
  votePost(@Param('postId') postId: number) {
    return this.postsService.votePost(postId);
  }

  @Post(':postId/assign/:assigneeId')
  assignPost(
    @Param('postId') postId: number,
    @Param('assigneeId') assigneeId: number,
  ) {
    return this.postsService.assignPost(postId, assigneeId);
  }

  @Post(':postId/complete')
  completePost(@Param('postId') postId: number) {
    return this.postsService.completePost(postId);
  }

  @Post(':postId/review')
  reviewPost(
    @Param('postId') postId: number,
    @Body('user_id') user_id: number,
    @Body('comments') comments: string,
    @Body('user_name') user_name: string,
    @Body('score') score: number,
  ) {
    const review = {
      user_id,
      comments,
      user_name,
      score,
    } as any;
    console.log('review', review);
    return this.postsService.reviewPost(postId, review);
  }
}
