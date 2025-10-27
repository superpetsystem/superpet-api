import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreEntity } from '../entities/store.entity';

@Injectable()
export class StoresRepository {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly repository: Repository<StoreEntity>,
  ) {}

  async create(data: Partial<StoreEntity>): Promise<StoreEntity> {
    const store = this.repository.create(data);
    return this.repository.save(store);
  }

  async findById(id: string): Promise<StoreEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['features'],
    });
  }

  async findByOrganizationAndId(organizationId: string, id: string): Promise<StoreEntity | null> {
    return this.repository.findOne({
      where: { id, organizationId },
      relations: ['features'],
    });
  }

  async findByOrganization(organizationId: string, active?: boolean): Promise<StoreEntity[]> {
    const where: any = { organizationId };
    
    if (active !== undefined) {
      where.active = active;
    }

    return this.repository.find({
      where,
      relations: ['features'],
    });
  }

  async findByCode(organizationId: string, code: string): Promise<StoreEntity | null> {
    return this.repository.findOne({
      where: { organizationId, code },
    });
  }

  async checkCodeExists(organizationId: string, code: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { organizationId, code },
    });
    return count > 0;
  }

  async update(id: string, data: Partial<StoreEntity>): Promise<StoreEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }
}
