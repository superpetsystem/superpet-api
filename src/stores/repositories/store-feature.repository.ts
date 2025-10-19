import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreFeatureEntity } from '../entities/store-feature.entity';

@Injectable()
export class StoreFeatureRepository {
  constructor(
    @InjectRepository(StoreFeatureEntity)
    private readonly repository: Repository<StoreFeatureEntity>,
  ) {}

  async create(data: Partial<StoreFeatureEntity>): Promise<StoreFeatureEntity> {
    const feature = this.repository.create(data);
    return this.repository.save(feature);
  }

  async findByStore(storeId: string): Promise<StoreFeatureEntity[]> {
    return this.repository.find({ where: { storeId } });
  }

  async findByStoreAndKey(storeId: string, featureKey: string): Promise<StoreFeatureEntity | null> {
    return this.repository.findOne({ where: { storeId, featureKey } });
  }

  async isFeatureEnabled(storeId: string, featureKey: string): Promise<boolean> {
    const feature = await this.findByStoreAndKey(storeId, featureKey);
    return feature?.enabled || false;
  }

  async upsert(storeId: string, featureKey: string, enabled: boolean, limits?: any): Promise<StoreFeatureEntity> {
    const existing = await this.findByStoreAndKey(storeId, featureKey);

    if (existing) {
      await this.repository.update(existing.id, { enabled, limits });
      return this.repository.findOne({ where: { id: existing.id } }) as Promise<StoreFeatureEntity>;
    }

    return this.create({ storeId, featureKey, enabled, limits });
  }
}


