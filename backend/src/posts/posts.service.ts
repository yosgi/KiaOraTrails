import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostRepository } from '../repositories/post.repository';
import { UserRepository } from '../repositories/user.repository';
import { ReviewRepository } from '../repositories/review.repository';
import { Post, POST_STATUS } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { Review } from '../entities/review.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: PostRepository,
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
    @InjectRepository(Review)
    private readonly reviewRepository: ReviewRepository,
  ) {}

  async getAllPosts() {
    return this.postRepository.find();
  }

  async getPostById(id: number) {
    return this.postRepository.findOne({
      where: { id },
      relations: ['reviews'],
    });
  }

  async createPost(draft: Partial<Post>) {
    const post = this.postRepository.create(draft);
    return this.postRepository.save(post);
  }

  async votePost(postId: number, isUpVote: boolean) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });
    if (!post) throw new NotFoundException('Post not found');

    if (isUpVote) {
      post.up_votes += 1;
      if (post.up_votes >= 5) {
        post.status = POST_STATUS.VOTED;
      }
    } else {
      post.down_votes += 1;
      if (post.down_votes >= 5) {
        post.status = POST_STATUS.REJECTED;
      }
    }

    return this.postRepository.save(post);
  }

  async assignPost(postId: number, assigneeId: string) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });
    if (!post) throw new NotFoundException('Post not found');

    post.assignee_id = assigneeId.toString();
    post.status = POST_STATUS.IN_CONSTRUCTION;
    return this.postRepository.save(post);
  }

  async completePost(postId: number) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });
    if (!post) throw new NotFoundException('Post not found');

    post.status = POST_STATUS.COMPLETED;
    post.completed_at = new Date();
    return this.postRepository.save(post);
  }

  async reviewPost(postId: number, draft: Partial<Review>) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) throw new NotFoundException('Post not found');

    const review = this.reviewRepository.create({
      post,
      ...draft,
      created_at: new Date(),
    });
    return this.reviewRepository.save(review);
  }
}
