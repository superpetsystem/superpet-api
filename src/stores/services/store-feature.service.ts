import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { StoreFeatureRepository } from '../repositories/store-feature.repository';
import { StoreFeatureEntity, FeatureAccessType } from '../entities/store-feature.entity';
import { FeatureService } from './feature.service';

@Injectable()
export class StoreFeatureService {
  constructor(
    private readonly storeFeatureRepository: StoreFeatureRepository,
    private readonly featureService: FeatureService,
  ) {}

  async findByStore(storeId: string): Promise<StoreFeatureEntity[]> {
    return this.storeFeatureRepository.findByStore(storeId);
  }

  async findByStoreAndAccessType(storeId: string, accessType: FeatureAccessType): Promise<StoreFeatureEntity[]> {
    return this.storeFeatureRepository.findByStoreAndAccessType(storeId, accessType);
  }

  async configureFeature(
    storeId: string,
    featureKey: string,
    enabled: boolean,
    storeLimits?: any,
    customerLimits?: any,
  ): Promise<StoreFeatureEntity[]> {
    // Validar dependências (CUSTOM_SERVICE precisa de SERVICE_CATALOG)
    if (featureKey === 'CUSTOM_SERVICE' && enabled) {
      const serviceCatalogEnabled = await this.storeFeatureRepository.isFeatureEnabledForAccessType(
        storeId,
        'SERVICE_CATALOG',
        FeatureAccessType.STORE,
      );

      if (!serviceCatalogEnabled) {
        throw new BadRequestException('FEATURE_DEPENDENCY_MISSING: SERVICE_CATALOG required');
      }
    }

    if (enabled) {
      // Usar o novo método do FeatureService que cria entradas STORE e CUSTOMER se necessário
      return this.featureService.enableFeatureForStore(storeId, featureKey, storeLimits, customerLimits);
    } else {
      // Desabilitar todas as entradas (STORE e CUSTOMER)
      await this.featureService.disableFeatureForStore(storeId, featureKey);
      return [];
    }
  }

  async isFeatureEnabled(storeId: string, featureKey: string): Promise<boolean> {
    return this.storeFeatureRepository.isFeatureEnabled(storeId, featureKey);
  }

  async isFeatureEnabledForAccessType(
    storeId: string, 
    featureKey: string, 
    accessType: FeatureAccessType
  ): Promise<boolean> {
    return this.storeFeatureRepository.isFeatureEnabledForAccessType(storeId, featureKey, accessType);
  }

  async getStoreFeatures(storeId: string): Promise<StoreFeatureEntity[]> {
    return this.storeFeatureRepository.findByStoreAndAccessType(storeId, FeatureAccessType.STORE);
  }

  async getCustomerFeatures(storeId: string): Promise<StoreFeatureEntity[]> {
    return this.storeFeatureRepository.findByStoreAndAccessType(storeId, FeatureAccessType.CUSTOMER);
  }
}


