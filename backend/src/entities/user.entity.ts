import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  role: string; // Example: "reader", "issuer", "voter", "donator", "admin"

  @Column()
  wallet_address: string;
}
