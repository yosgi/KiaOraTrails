import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  reviewer: User;

  @ManyToOne(() => Post, (post) => post.reviews)
  post: Post;

  @Column({ type: 'int' })
  score: number;
}
