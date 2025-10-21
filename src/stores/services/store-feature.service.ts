import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { StoreFeatureRepository } from '../repositories/store-feature.repository';
import { StoreFeatureEntity } from '../entities/store-feature.entity';

@Injectable()
export class StoreFeatureService {
  constructor(private readonly storeFeatureRepository: StoreFeatureRepository) {}

  async findByStore(storeId: string): Promise<StoreFeatureEntity[]> {
    return this.storeFeatureRepository.findByStore(storeId);
  }

  async configureFeature(
    storeId: string,
    featureKey: string,
    enabled: boolean,
    limits?: any,
  ): Promise<StoreFeatureEntity> {
    // Validar dependências (CUSTOM_SERVICE precisa de SERVICE_CATALOG)
    if (featureKey === 'CUSTOM_SERVICE' && enabled) {
      const serviceCatalogEnabled = await this.storeFeatureRepository.isFeatureEnabled(
        storeId,
        'SERVICE_CATALOG',
      );

      if (!serviceCatalogEnabled) {
        throw new BadRequestException('FEATURE_DEPENDENCY_MISSING: SERVICE_CATALOG required');
      }
    }

    return this.storeFeatureRepository.upsert(storeId, featureKey, enabled, limits);
  }

  async isFeatureEnabled(storeId: string, featureKey: string): Promise<boolean> {
    return this.storeFeatureRepository.isFeatureEnabled(storeId, featureKey);
  }
}


