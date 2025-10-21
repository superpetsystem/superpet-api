import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { PasswordResetEntity } from '../entities/password-reset.entity';

@Injectable()
export class PasswordResetRepository {
  constructor(
    @InjectRepository(PasswordResetEntity)
    private readonly repository: Repository<PasswordResetEntity>,
  ) {}

  async create(data: Partial<PasswordResetEntity>): Promise<PasswordResetEntity> {
    const reset = this.repository.create(data);
    return this.repository.save(reset);
  }

  async findByToken(token: string): Promise<PasswordResetEntity | null> {
    return this.repository.findOne({
      where: { token, used: false },
      relations: ['user'],
    });
  }

  async markAsUsed(id: string): Promise<void> {
    await this.repository.update(id, { used: true });
  }

  async deleteExpired(): Promise<void> {
    await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }
}

