import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Review } from './review.entity';

export enum POST_TYPE {
  FUNDRAISING = 'fundraising',
  SCENIC = 'scenic',
  CONDITION = 'condition',
}

export enum POST_STATUS {
  CREATED = 'created',
  VOTED = 'voted',
  DONATED = 'donated',
  IN_CONSTRUCTION = 'in_construction',
  COMPLETED = 'completed',
  REVIEWED = 'reviewed',
  CANCELLED = 'cancelled',
}

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'json', nullable: true })
  photos: string[];

  @Column({ nullable: true })
  user_id: string;

  @Column({ nullable: true })
  donator_id: string; // The donator who funds the post

  @Column({ nullable: true })
  assignee_id: string; // The user assigned to complete the post

  @Column()
  type: POST_TYPE;

  @Column({ default: POST_STATUS.CREATED })
  status: POST_STATUS;

  @Column({ default: 0 })
  up_votes: number;

  @Column({ default: 0 })
  down_votes: number;

  @Column({ nullable: true })
  created_at: Date;

  @Column({ nullable: true })
  voted_at: Date;

  @Column({ nullable: true })
  completed_at: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fund: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cur_fund: number;

  @OneToMany(() => Review, (review) => review.post)
  reviews: Review[];
}
