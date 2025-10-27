import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FeatureEntity, FeatureCategory, OrganizationPlan } from '../entities/feature.entity';
import { StoreFeatureEntity, FeatureAccessType, FeatureLimits } from '../entities/store-feature.entity';

@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(FeatureEntity)
    private readonly featureRepository: Repository<FeatureEntity>,
    @InjectRepository(StoreFeatureEntity)
    private readonly storeFeatureRepository: Repository<StoreFeatureEntity>,
  ) {}

  /**
   * Cria uma nova feature no sistema
   */
  async createFeature(data: {
    key: string;
    name: string;
    description?: string;
    category: FeatureCategory;
    minPlanRequired: OrganizationPlan;
    defaultLimits?: any;
    metadata?: any;
    divisible?: boolean;
  }): Promise<FeatureEntity> {
    const feature = this.featureRepository.create(data);
    return this.featureRepository.save(feature);
  }

  /**
   * Lista todas as features disponíveis
   */
  async findAllFeatures(): Promise<FeatureEntity[]> {
    return this.featureRepository.find({
      where: { active: true },
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Lista features por categoria
   */
  async findByCategory(category: FeatureCategory): Promise<FeatureEntity[]> {
    return this.featureRepository.find({
      where: { category, active: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Lista features por plano mínimo
   */
  async findByMinPlan(plan: OrganizationPlan): Promise<FeatureEntity[]> {
    return this.featureRepository.find({
      where: { minPlanRequired: plan, active: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtém uma feature por key
   */
  async findByKey(key: string): Promise<FeatureEntity | null> {
    return this.featureRepository.findOne({
      where: { key, active: true },
    });
  }

  /**
   * Atualiza uma feature
   */
  async updateFeature(key: string, data: Partial<FeatureEntity>): Promise<FeatureEntity | null> {
    await this.featureRepository.update({ key }, data);
    return this.findByKey(key);
  }

  /**
   * Desativa uma feature
   */
  async deactivateFeature(key: string): Promise<void> {
    await this.featureRepository.update({ key }, { active: false });
  }

  /**
   * Ativa uma feature
   */
  async activateFeature(key: string): Promise<void> {
    await this.featureRepository.update({ key }, { active: true });
  }

  /**
   * Lista features divisíveis (que podem ter acesso de cliente)
   */
  async findDivisibleFeatures(): Promise<FeatureEntity[]> {
    return this.featureRepository.find({
      where: { divisible: true, active: true },
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Habilita uma feature para uma loja
   * Se a feature for divisível, cria duas entradas: STORE e CUSTOMER
   */
  async enableFeatureForStore(
    storeId: string,
    featureKey: string,
    storeLimits?: FeatureLimits,
    customerLimits?: FeatureLimits,
  ): Promise<StoreFeatureEntity[]> {
    const feature = await this.findByKey(featureKey);
    if (!feature) {
      throw new Error(`Feature ${featureKey} não encontrada`);
    }

    const results: StoreFeatureEntity[] = [];

    // Sempre criar entrada para STORE
    const storeFeature = await this.createOrUpdateStoreFeature(
      storeId,
      featureKey,
      FeatureAccessType.STORE,
      storeLimits || feature.defaultLimits,
    );
    results.push(storeFeature);

    // Se a feature for divisível, criar também entrada para CUSTOMER
    if (feature.divisible) {
      const customerFeature = await this.createOrUpdateStoreFeature(
        storeId,
        featureKey,
        FeatureAccessType.CUSTOMER,
        customerLimits || feature.defaultLimits,
      );
      results.push(customerFeature);
    }

    return results;
  }

  /**
   * Desabilita uma feature para uma loja
   * Remove todas as entradas (STORE e CUSTOMER se existirem)
   */
  async disableFeatureForStore(storeId: string, featureKey: string): Promise<void> {
    await this.storeFeatureRepository.delete({
      storeId,
      featureKey,
    });
  }

  /**
   * Verifica se uma feature está habilitada para funcionários da loja
   */
  async isFeatureEnabledForStore(storeId: string, featureKey: string): Promise<boolean> {
    const storeFeature = await this.storeFeatureRepository.findOne({
      where: {
        storeId,
        featureKey,
        accessType: FeatureAccessType.STORE,
        enabled: true,
      },
    });
    return !!storeFeature;
  }

  /**
   * Verifica se uma feature está habilitada para clientes
   */
  async isFeatureEnabledForCustomers(storeId: string, featureKey: string): Promise<boolean> {
    const customerFeature = await this.storeFeatureRepository.findOne({
      where: {
        storeId,
        featureKey,
        accessType: FeatureAccessType.CUSTOMER,
        enabled: true,
      },
    });
    return !!customerFeature;
  }

  /**
   * Obtém configuração de uma feature para funcionários da loja
   */
  async getStoreFeatureConfig(storeId: string, featureKey: string): Promise<StoreFeatureEntity | null> {
    return this.storeFeatureRepository.findOne({
      where: {
        storeId,
        featureKey,
        accessType: FeatureAccessType.STORE,
        enabled: true,
      },
      relations: ['feature'],
    });
  }

  /**
   * Obtém configuração de uma feature para clientes
   */
  async getCustomerFeatureConfig(storeId: string, featureKey: string): Promise<StoreFeatureEntity | null> {
    return this.storeFeatureRepository.findOne({
      where: {
        storeId,
        featureKey,
        accessType: FeatureAccessType.CUSTOMER,
        enabled: true,
      },
      relations: ['feature'],
    });
  }

  /**
   * Lista todas as features habilitadas para uma loja (apenas STORE)
   */
  async getStoreEnabledFeatures(storeId: string): Promise<StoreFeatureEntity[]> {
    return this.storeFeatureRepository.find({
      where: {
        storeId,
        accessType: FeatureAccessType.STORE,
        enabled: true,
      },
      relations: ['feature'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Lista todas as features habilitadas para clientes de uma loja
   */
  async getCustomerEnabledFeatures(storeId: string): Promise<StoreFeatureEntity[]> {
    return this.storeFeatureRepository.find({
      where: {
        storeId,
        accessType: FeatureAccessType.CUSTOMER,
        enabled: true,
      },
      relations: ['feature'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Cria ou atualiza uma entrada de feature para uma loja
   */
  private async createOrUpdateStoreFeature(
    storeId: string,
    featureKey: string,
    accessType: FeatureAccessType,
    limits?: FeatureLimits,
  ): Promise<StoreFeatureEntity> {
    const existing = await this.storeFeatureRepository.findOne({
      where: { storeId, featureKey, accessType },
    });

    if (existing) {
      existing.enabled = true;
      existing.limits = limits || null;
      return this.storeFeatureRepository.save(existing);
    }

    const storeFeature = this.storeFeatureRepository.create({
      storeId,
      featureKey,
      accessType,
      enabled: true,
      limits: limits || null,
    });

    return this.storeFeatureRepository.save(storeFeature);
  }
}