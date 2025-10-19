import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async create(data: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async findByEmail(organizationId: string, email: string): Promise<UserEntity | null> {
    return this.repository.findOne({
      where: { organizationId, email, deletedAt: IsNull() },
    });
  }

  async findByEmailGlobal(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  async checkEmailExists(organizationId: string, email: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { organizationId, email, deletedAt: IsNull() },
    });
    return count > 0;
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.update(id, { deletedAt: new Date() });
  }
}
