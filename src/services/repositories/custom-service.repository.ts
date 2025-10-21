import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CustomServiceEntity, CustomServiceState } from '../entities/custom-service.entity';

@Injectable()
export class CustomServiceRepository {
  constructor(
    @InjectRepository(CustomServiceEntity)
    private readonly repository: Repository<CustomServiceEntity>,
  ) {}

  async create(data: Partial<CustomServiceEntity>): Promise<CustomServiceEntity> {
    const customService = this.repository.create(data);
    return this.repository.save(customService);
  }

  async findById(id: string): Promise<CustomServiceEntity | null> {
    return this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['service', 'store'],
    });
  }

  async findByStore(storeId: string, filters?: { serviceId?: string; state?: CustomServiceState }): Promise<CustomServiceEntity[]> {
    const where: any = { storeId, deletedAt: IsNull() };

    if (filters?.serviceId) {
      where.serviceId = filters.serviceId;
    }

    if (filters?.state) {
      where.state = filters.state;
    }

    return this.repository.find({
      where,
      relations: ['service'],
    });
  }

  async findPublished(storeId: string, serviceId: string): Promise<CustomServiceEntity | null> {
    return this.repository.findOne({
      where: {
        storeId,
        serviceId,
        state: CustomServiceState.PUBLISHED,
        deletedAt: IsNull(),
      },
      relations: ['service'],
    });
  }

  async checkExists(storeId: string, serviceId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { storeId, serviceId, deletedAt: IsNull() },
    });
    return count > 0;
  }

  async update(id: string, data: Partial<CustomServiceEntity>): Promise<CustomServiceEntity | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.update(id, { deletedAt: new Date() });
  }
}



