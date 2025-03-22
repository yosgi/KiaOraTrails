import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Review } from './review.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, (user) => user.posts)
  author: User;

  @Column({ default: 0 })
  votes: number;

  @ManyToOne(() => User, { nullable: true })
  donator: User; // The donator who funds the post

  @ManyToOne(() => User, { nullable: true })
  assignee: User; // The user assigned to complete the post

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  payment: number; // Payment for completing the post

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  bonus: number; // Bonus if reviewed positively

  @OneToMany(() => Review, (review) => review.post)
  reviews: Review[];
}
