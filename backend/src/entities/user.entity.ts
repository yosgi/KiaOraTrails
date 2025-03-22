import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Post } from './post.entity';
import { Review } from './review.entity';

export enum UserRole {
  ISSUER = 'issuer',
  DONATOR = 'donator',
  ADMIN = 'admin',
  ASSIGNEE = 'assignee',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  role: UserRole; // Example: "issuer", "assignee", "donator", "admin"

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Review, (review) => review.reviewer)
  reviews: Review[];
}
