import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreFeatureAccessEntity, FeatureAccessType, CustomerAccessConfig } from '../entities/feature-access.entity';

@Injectable()
export class FeatureAccessService {
  constructor(
    @InjectRepository(StoreFeatureAccessEntity)
    private readonly featureAccessRepository: Repository<StoreFeatureAccessEntity>,
  ) {}

  /**
   * Configura o tipo de acesso de uma feature para uma loja
   */
  async configureFeatureAccess(
    storeId: string,
    featureKey: string,
    accessType: FeatureAccessType,
    customerConfig?: CustomerAccessConfig,
  ): Promise<StoreFeatureAccessEntity> {
    console.log(`🔧 ConfigureFeatureAccess: storeId=${storeId}, featureKey=${featureKey}, accessType=${accessType}`);
    
    try {
      const existing = await this.featureAccessRepository.findOne({
        where: { storeId, featureKey },
      });

      if (existing) {
        console.log(`📝 Updating existing feature access: ${existing.id}`);
        existing.accessType = accessType;
        existing.customerAccessConfig = customerConfig || null;
        return this.featureAccessRepository.save(existing);
      }

      console.log(`🆕 Creating new feature access`);
      const featureAccess = this.featureAccessRepository.create({
        storeId,
        featureKey,
        accessType,
        customerAccessConfig: customerConfig || null,
      });

      console.log(`💾 Saving feature access: ${JSON.stringify(featureAccess)}`);
      return this.featureAccessRepository.save(featureAccess);
    } catch (error) {
      console.error(`❌ Error in configureFeatureAccess:`, error);
      throw error;
    }
  }

  /**
   * Verifica se uma feature está disponível para clientes em uma loja
   */
  async isFeatureAvailableForCustomers(
    storeId: string,
    featureKey: string,
  ): Promise<boolean> {
    const featureAccess = await this.featureAccessRepository.findOne({
      where: { storeId, featureKey, enabled: true },
    });

    return featureAccess?.accessType === FeatureAccessType.STORE_AND_CUSTOMER;
  }

  /**
   * Obtém configuração de acesso do cliente para uma feature
   */
  async getCustomerAccessConfig(
    storeId: string,
    featureKey: string,
  ): Promise<CustomerAccessConfig | null> {
    const featureAccess = await this.featureAccessRepository.findOne({
      where: { storeId, featureKey, enabled: true },
    });

    return featureAccess?.customerAccessConfig || null;
  }

  /**
   * Lista todas as features configuradas para uma loja
   */
  async getStoreFeatures(storeId: string): Promise<StoreFeatureAccessEntity[]> {
    return this.featureAccessRepository.find({
      where: { storeId, enabled: true },
      relations: ['feature'],
    });
  }

  /**
   * Lista features disponíveis para clientes de uma loja
   */
  async getCustomerAvailableFeatures(storeId: string): Promise<StoreFeatureAccessEntity[]> {
    return this.featureAccessRepository.find({
      where: {
        storeId,
        accessType: FeatureAccessType.STORE_AND_CUSTOMER,
        enabled: true,
      },
      relations: ['feature'],
    });
  }

  /**
   * Desabilita uma feature para uma loja
   */
  async disableFeature(storeId: string, featureKey: string): Promise<void> {
    await this.featureAccessRepository.update(
      { storeId, featureKey },
      { enabled: false },
    );
  }

  /**
   * Habilita uma feature para uma loja
   */
  async enableFeature(storeId: string, featureKey: string): Promise<void> {
    await this.featureAccessRepository.update(
      { storeId, featureKey },
      { enabled: true },
    );
  }
}
