import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  create(name: string, email: string, role: string): Promise<User> {
    const user = this.userRepository.create({ name, email, role });
    return this.userRepository.save(user);
  }

  async update(
    id: number,
    name: string,
    email: string,
    role: string,
  ): Promise<User> {
    await this.userRepository.update(id, { name, email, role });
    return this.userRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
