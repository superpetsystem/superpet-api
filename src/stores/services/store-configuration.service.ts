import { Injectable } from '@nestjs/common';
import { FeatureAccessService } from './feature-access.service';
import { FeatureAccessType, CustomerAccessConfig } from '../entities/feature-access.entity';

@Injectable()
export class StoreConfigurationService {
  constructor(
    private readonly featureAccessService: FeatureAccessService,
  ) {}

  /**
   * Configura uma loja com features básicas (apenas loja)
   */
  async setupBasicStore(storeId: string): Promise<void> {
    const basicFeatures = [
      'SERVICE_CATALOG',
      'PRODUCT_CATALOG', 
      'VETERINARY_RECORDS',
      'VACCINATION_RECORDS',
      'GROOMING_NOTES',
    ];

    for (const featureKey of basicFeatures) {
      await this.featureAccessService.configureFeatureAccess(
        storeId,
        featureKey,
        FeatureAccessType.STORE_ONLY,
      );
    }
  }

  /**
   * Configura uma loja com features para clientes (loja + cliente)
   */
  async setupCustomerEnabledStore(storeId: string): Promise<void> {
    const customerFeatures = [
      {
        key: 'CUSTOMER_REGISTRATION',
        config: {
          allowSelfRegistration: true,
          requireApproval: false,
        } as CustomerAccessConfig,
      },
      {
        key: 'PET_REGISTRATION',
        config: {
          allowSelfService: true,
          maxPetsPerCustomer: 5,
        } as CustomerAccessConfig,
      },
      {
        key: 'ONLINE_BOOKING',
        config: {
          allowSelfService: true,
          requireApproval: true, // Requer aprovação da loja
          maxBookingsPerDay: 3,
        } as CustomerAccessConfig,
      },
      {
        key: 'SERVICE_CATALOG',
        config: {
          allowSelfService: true,
          showPricing: true,
        } as CustomerAccessConfig,
      },
      {
        key: 'PRODUCT_CATALOG',
        config: {
          allowSelfService: true,
          showPricing: true,
          allowOnlinePurchase: false, // Apenas visualização
        } as CustomerAccessConfig,
      },
      {
        key: 'VETERINARY_RECORDS',
        config: {
          allowSelfService: true,
          showFullHistory: true,
        } as CustomerAccessConfig,
      },
      {
        key: 'VACCINATION_RECORDS',
        config: {
          allowSelfService: true,
          showNextDue: true,
        } as CustomerAccessConfig,
      },
      {
        key: 'GROOMING_NOTES',
        config: {
          allowSelfService: true,
          showPhotos: true,
          showNotes: true,
        } as CustomerAccessConfig,
      },
    ];

    for (const feature of customerFeatures) {
      await this.featureAccessService.configureFeatureAccess(
        storeId,
        feature.key,
        FeatureAccessType.STORE_AND_CUSTOMER,
        feature.config,
      );
    }
  }

  /**
   * Configura uma loja premium (todas as features para clientes)
   */
  async setupPremiumStore(storeId: string): Promise<void> {
    const premiumFeatures = [
      {
        key: 'CUSTOMER_REGISTRATION',
        config: {
          allowSelfRegistration: true,
          requireApproval: false,
        } as CustomerAccessConfig,
      },
      {
        key: 'PET_REGISTRATION',
        config: {
          allowSelfService: true,
          maxPetsPerCustomer: 10,
        } as CustomerAccessConfig,
      },
      {
        key: 'ONLINE_BOOKING',
        config: {
          allowSelfService: true,
          requireApproval: false, // Sem aprovação necessária
          maxBookingsPerDay: 10,
        } as CustomerAccessConfig,
      },
      {
        key: 'LIVE_CAM',
        config: {
          allowSelfService: true,
          maxConcurrentStreams: 5,
          maxDailyMinutes: 120,
        } as CustomerAccessConfig,
      },
      {
        key: 'TELEPICKUP',
        config: {
          allowSelfService: true,
          maxDailyPickups: 5,
          requireAdvanceNotice: 1, // Apenas 1 hora de antecedência
        } as CustomerAccessConfig,
      },
      {
        key: 'LOYALTY_PROGRAM',
        config: {
          allowSelfService: true,
          showPoints: true,
          allowRedemption: true,
        } as CustomerAccessConfig,
      },
      {
        key: 'ONLINE_PAYMENTS',
        config: {
          allowSelfService: true,
          supportedMethods: ['PIX', 'CARD', 'BOLETO'],
          maxTransactionValue: 5000,
        } as CustomerAccessConfig,
      },
      {
        key: 'CUSTOMER_PORTAL',
        config: {
          allowSelfService: true,
          allowProfileManagement: true,
          allowHistoryAccess: true,
        } as CustomerAccessConfig,
      },
    ];

    for (const feature of premiumFeatures) {
      await this.featureAccessService.configureFeatureAccess(
        storeId,
        feature.key,
        FeatureAccessType.STORE_AND_CUSTOMER,
        feature.config,
      );
    }
  }

  /**
   * Atualiza configuração específica de uma feature
   */
  async updateFeatureConfig(
    storeId: string,
    featureKey: string,
    newConfig: CustomerAccessConfig,
  ): Promise<void> {
    await this.featureAccessService.configureFeatureAccess(
      storeId,
      featureKey,
      FeatureAccessType.STORE_AND_CUSTOMER,
      newConfig,
    );
  }

  /**
   * Migra uma loja de "apenas loja" para "loja + cliente"
   */
  async migrateToCustomerEnabled(
    storeId: string,
    featuresToEnable: string[],
  ): Promise<void> {
    for (const featureKey of featuresToEnable) {
      // Verificar se a feature pode ser habilitada para clientes
      const isAvailable = await this.featureAccessService.isFeatureAvailableForCustomers(
        storeId,
        featureKey,
      );

      if (!isAvailable) {
        // Configurar como STORE_AND_CUSTOMER
        await this.featureAccessService.configureFeatureAccess(
          storeId,
          featureKey,
          FeatureAccessType.STORE_AND_CUSTOMER,
        );
      }
    }
  }

  /**
   * Obtém relatório de configuração da loja
   */
  async getStoreConfigurationReport(storeId: string): Promise<any> {
    const allFeatures = await this.featureAccessService.getStoreFeatures(storeId);
    const customerFeatures = await this.featureAccessService.getCustomerAvailableFeatures(storeId);

    return {
      storeId,
      totalFeatures: allFeatures.length,
      customerEnabledFeatures: customerFeatures.length,
      storeOnlyFeatures: allFeatures.length - customerFeatures.length,
      features: allFeatures.map(feature => ({
        key: feature.featureKey,
        name: feature.feature?.name,
        accessType: feature.accessType,
        enabled: feature.enabled,
        customerConfig: feature.customerAccessConfig,
      })),
    };
  }
}
