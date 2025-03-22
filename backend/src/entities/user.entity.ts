import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// import { Post } from './post.entity';
// import { Review } from './review.entity';

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

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  role: UserRole; // Example: "issuer", "assignee", "donator", "admin"

  @Column({ nullable: true })
  created_at: Date;
}
