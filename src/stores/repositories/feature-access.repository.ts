import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreFeatureAccessEntity, FeatureAccessType } from '../entities/feature-access.entity';

@Injectable()
export class FeatureAccessRepository {
  constructor(
    @InjectRepository(StoreFeatureAccessEntity)
    private readonly repository: Repository<StoreFeatureAccessEntity>,
  ) {}

  async create(data: Partial<StoreFeatureAccessEntity>): Promise<StoreFeatureAccessEntity> {
    const featureAccess = this.repository.create(data);
    return this.repository.save(featureAccess);
  }

  async findByStoreAndFeature(
    storeId: string,
    featureKey: string,
  ): Promise<StoreFeatureAccessEntity | null> {
    return this.repository.findOne({
      where: { storeId, featureKey },
      relations: ['feature'],
    });
  }

  async findByStore(storeId: string): Promise<StoreFeatureAccessEntity[]> {
    return this.repository.find({
      where: { storeId, enabled: true },
      relations: ['feature'],
    });
  }

  async findCustomerAccessibleFeatures(storeId: string): Promise<StoreFeatureAccessEntity[]> {
    return this.repository.find({
      where: {
        storeId,
        accessType: FeatureAccessType.STORE_AND_CUSTOMER,
        enabled: true,
      },
      relations: ['feature'],
    });
  }

  async updateAccessType(
    storeId: string,
    featureKey: string,
    accessType: FeatureAccessType,
  ): Promise<void> {
    await this.repository.update(
      { storeId, featureKey },
      { accessType },
    );
  }

  async updateCustomerConfig(
    storeId: string,
    featureKey: string,
    customerConfig: any,
  ): Promise<void> {
    await this.repository.update(
      { storeId, featureKey },
      { customerAccessConfig: customerConfig },
    );
  }

  async enableFeature(storeId: string, featureKey: string): Promise<void> {
    await this.repository.update(
      { storeId, featureKey },
      { enabled: true },
    );
  }

  async disableFeature(storeId: string, featureKey: string): Promise<void> {
    await this.repository.update(
      { storeId, featureKey },
      { enabled: false },
    );
  }

  async deleteByStoreAndFeature(storeId: string, featureKey: string): Promise<void> {
    await this.repository.delete({ storeId, featureKey });
  }
}
