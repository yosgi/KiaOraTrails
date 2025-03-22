import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostRepository } from '../repositories/post.repository';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { UserRepository } from '../repositories/user.repository';
import { ReviewRepository } from '../repositories/review.repository';
import { Post } from 'src/entities/post.entity';
import { User } from 'src/entities/user.entity';
import { Review } from 'src/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      PostRepository,
      User,
      UserRepository,
      Review,
      ReviewRepository,
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [TypeOrmModule], // Export TypeOrmModule if needed in other modules
})
export class PostsModule {}
