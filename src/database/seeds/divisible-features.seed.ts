import { DataSource } from 'typeorm';
import { FeatureEntity, FeatureCategory, OrganizationPlan } from '../../stores/entities/feature.entity';

export async function seedDivisibleFeatures(dataSource: DataSource): Promise<void> {
  const featureRepository = dataSource.getRepository(FeatureEntity);

  const divisibleFeatures = [
    // CUSTOMER FEATURES
    {
      key: 'CUSTOMER_REGISTRATION',
      name: 'Cadastro de Clientes',
      description: 'Permite que clientes se cadastrem no sistema',
      category: FeatureCategory.CUSTOMER,
      minPlanRequired: OrganizationPlan.FREE,
      defaultLimits: {
        allowSelfRegistration: true,
        requireApproval: false,
      },
      divisible: true,
      metadata: {
        icon: 'user-plus',
        color: '#10B981',
        order: 1,
      },
    },
    {
      key: 'PET_REGISTRATION',
      name: 'Cadastro de Pets',
      description: 'Permite que clientes cadastrem seus pets',
      category: FeatureCategory.CUSTOMER,
      minPlanRequired: OrganizationPlan.FREE,
      defaultLimits: {
        allowSelfService: true,
        maxPetsPerCustomer: 10,
      },
      divisible: true,
      metadata: {
        icon: 'paw',
        color: '#F59E0B',
        order: 2,
      },
    },
    {
      key: 'ONLINE_BOOKING',
      name: 'Agendamento Online',
      description: 'Permite que clientes agendem serviços online',
      category: FeatureCategory.SERVICES,
      minPlanRequired: OrganizationPlan.BASIC,
      defaultLimits: {
        allowSelfService: true,
        requireApproval: false,
        maxBookingsPerDay: 5,
      },
      metadata: {
        icon: 'calendar',
        color: '#3B82F6',
        order: 3,
      },
    },
    {
      key: 'SERVICE_CATALOG',
      name: 'Catálogo de Serviços',
      description: 'Permite que clientes visualizem serviços disponíveis',
      category: FeatureCategory.SERVICES,
      minPlanRequired: OrganizationPlan.FREE,
      defaultLimits: {
        allowSelfService: true,
        showPricing: true,
      },
      metadata: {
        icon: 'list',
        color: '#8B5CF6',
        order: 4,
      },
    },
    {
      key: 'PRODUCT_CATALOG',
      name: 'Catálogo de Produtos',
      description: 'Permite que clientes visualizem produtos disponíveis',
      category: FeatureCategory.SERVICES,
      minPlanRequired: OrganizationPlan.BASIC,
      defaultLimits: {
        allowSelfService: true,
        showPricing: true,
        allowOnlinePurchase: false,
      },
      metadata: {
        icon: 'shopping-bag',
        color: '#EF4444',
        order: 5,
      },
    },
    {
      key: 'VETERINARY_RECORDS',
      name: 'Prontuário Veterinário',
      description: 'Permite que clientes visualizem prontuários de seus pets',
      category: FeatureCategory.CUSTOMER,
      minPlanRequired: OrganizationPlan.PRO,
      defaultLimits: {
        allowSelfService: true,
        showFullHistory: true,
      },
      metadata: {
        icon: 'file-medical',
        color: '#06B6D4',
        order: 6,
      },
    },
    {
      key: 'VACCINATION_RECORDS',
      name: 'Ficha de Vacinação',
      description: 'Permite que clientes visualizem vacinas de seus pets',
      category: FeatureCategory.CUSTOMER,
      minPlanRequired: OrganizationPlan.BASIC,
      defaultLimits: {
        allowSelfService: true,
        showNextDue: true,
      },
      metadata: {
        icon: 'syringe',
        color: '#10B981',
        order: 7,
      },
    },
    {
      key: 'LIVE_CAM',
      name: 'Live Cam',
      description: 'Permite que clientes visualizem seus pets via câmera',
      category: FeatureCategory.CUSTOMER,
      minPlanRequired: OrganizationPlan.PRO,
      defaultLimits: {
        allowSelfService: true,
        maxConcurrentStreams: 2,
        maxDailyMinutes: 60,
      },
      metadata: {
        icon: 'video',
        color: '#F97316',
        order: 8,
      },
    },
    {
      key: 'TELEPICKUP',
      name: 'Tele-busca',
      description: 'Permite que clientes solicitem busca de seus pets',
      category: FeatureCategory.OPERATIONS,
      minPlanRequired: OrganizationPlan.PRO,
      defaultLimits: {
        allowSelfService: true,
        maxDailyPickups: 3,
        requireAdvanceNotice: 2, // horas
      },
      metadata: {
        icon: 'truck',
        color: '#84CC16',
        order: 9,
      },
    },
    {
      key: 'LOYALTY_PROGRAM',
      name: 'Programa de Fidelidade',
      description: 'Permite que clientes participem do programa de fidelidade',
      category: FeatureCategory.CUSTOMER,
      minPlanRequired: OrganizationPlan.BASIC,
      defaultLimits: {
        allowSelfService: true,
        showPoints: true,
        allowRedemption: true,
      },
      metadata: {
        icon: 'gift',
        color: '#EC4899',
        order: 10,
      },
    },
    {
      key: 'CUSTOMER_PORTAL',
      name: 'Portal do Cliente',
      description: 'Portal completo para clientes gerenciarem seus dados',
      category: FeatureCategory.CUSTOMER,
      minPlanRequired: OrganizationPlan.PRO,
      defaultLimits: {
        allowSelfService: true,
        allowProfileManagement: true,
        allowHistoryAccess: true,
      },
      metadata: {
        icon: 'user-circle',
        color: '#6366F1',
        order: 11,
      },
    },
    {
      key: 'ONLINE_PAYMENTS',
      name: 'Pagamentos Online',
      description: 'Permite que clientes façam pagamentos online',
      category: FeatureCategory.OPERATIONS,
      minPlanRequired: OrganizationPlan.PRO,
      defaultLimits: {
        allowSelfService: true,
        supportedMethods: ['PIX', 'CARD'],
        maxTransactionValue: 1000,
      },
      metadata: {
        icon: 'credit-card',
        color: '#059669',
        order: 12,
      },
    },
    {
      key: 'SUBSCRIPTIONS',
      name: 'Assinaturas',
      description: 'Permite que clientes gerenciem assinaturas de produtos',
      category: FeatureCategory.OPERATIONS,
      minPlanRequired: OrganizationPlan.ENTERPRISE,
      defaultLimits: {
        allowSelfService: true,
        allowModification: true,
        allowCancellation: true,
      },
      metadata: {
        icon: 'refresh-cw',
        color: '#7C3AED',
        order: 13,
      },
    },
    {
      key: 'DELIVERY_SERVICE',
      name: 'Entrega/Retirada',
      description: 'Permite que clientes solicitem entrega ou retirada',
      category: FeatureCategory.OPERATIONS,
      minPlanRequired: OrganizationPlan.BASIC,
      defaultLimits: {
        allowSelfService: true,
        maxDailyRequests: 2,
        requireAdvanceNotice: 4, // horas
      },
      metadata: {
        icon: 'package',
        color: '#DC2626',
        order: 14,
      },
    },
    {
      key: 'GROOMING_NOTES',
      name: 'Grooming Notes + Fotos',
      description: 'Permite que clientes visualizem fotos antes/depois',
      category: FeatureCategory.CUSTOMER,
      minPlanRequired: OrganizationPlan.BASIC,
      defaultLimits: {
        allowSelfService: true,
        showPhotos: true,
        showNotes: true,
      },
      metadata: {
        icon: 'camera',
        color: '#F59E0B',
        order: 15,
      },
    },
    {
      key: 'HOTEL_RESERVATIONS',
      name: 'Reservas de Hotel/Creche',
      description: 'Permite que clientes façam reservas de hospedagem',
      category: FeatureCategory.SERVICES,
      minPlanRequired: OrganizationPlan.PRO,
      defaultLimits: {
        allowSelfService: true,
        requireAdvanceNotice: 24, // horas
        maxConcurrentReservations: 3,
      },
      metadata: {
        icon: 'home',
        color: '#0891B2',
        order: 16,
      },
    },
    {
      key: 'DIGITAL_CARD',
      name: 'Carteirinha Digital',
      description: 'Permite que clientes tenham carteirinha digital do pet',
      category: FeatureCategory.CUSTOMER,
      minPlanRequired: OrganizationPlan.BASIC,
      defaultLimits: {
        allowSelfService: true,
        showQRCode: true,
        showVaccinationHistory: true,
      },
      metadata: {
        icon: 'id-card',
        color: '#10B981',
        order: 17,
      },
    },
    {
      key: 'CUSTOMER_REVIEWS',
      name: 'Avaliações/NPS',
      description: 'Permite que clientes avaliem serviços',
      category: FeatureCategory.CUSTOMER,
      minPlanRequired: OrganizationPlan.BASIC,
      defaultLimits: {
        allowSelfService: true,
        allowMultipleReviews: false,
        showPublicReviews: true,
      },
      metadata: {
        icon: 'star',
        color: '#F59E0B',
        order: 18,
      },
    },
    {
      key: 'MEDICAL_RECORDS',
      name: 'Exames e Laudos',
      description: 'Permite que clientes visualizem exames de seus pets',
      category: FeatureCategory.CUSTOMER,
      minPlanRequired: OrganizationPlan.PRO,
      defaultLimits: {
        allowSelfService: true,
        showFullHistory: true,
        allowDownload: true,
      },
      metadata: {
        icon: 'file-text',
        color: '#06B6D4',
        order: 19,
      },
    },
    {
      key: 'HEALTH_INSURANCE',
      name: 'Plano de Saúde/Convênios',
      description: 'Permite que clientes usem convênios veterinários',
      category: FeatureCategory.SERVICES,
      minPlanRequired: OrganizationPlan.PRO,
      defaultLimits: {
        allowSelfService: true,
        showCoverage: true,
        allowClaims: true,
      },
      metadata: {
        icon: 'shield',
        color: '#059669',
        order: 20,
      },
    },
    {
      key: 'MARKETING_AUTOMATION',
      name: 'Automações de Marketing',
      description: 'Permite que clientes recebam campanhas personalizadas',
      category: FeatureCategory.CUSTOMER,
      minPlanRequired: OrganizationPlan.ENTERPRISE,
      defaultLimits: {
        allowSelfService: true,
        allowOptOut: true,
        maxEmailsPerMonth: 10,
      },
      metadata: {
        icon: 'mail',
        color: '#EC4899',
        order: 21,
      },
    },
    {
      key: 'OMNICHANNEL_CATALOG',
      name: 'Catálogo Omnichannel',
      description: 'Permite que clientes vejam estoque unificado',
      category: FeatureCategory.SERVICES,
      minPlanRequired: OrganizationPlan.ENTERPRISE,
      defaultLimits: {
        allowSelfService: true,
        showRealTimeStock: true,
        allowCrossStorePurchase: false,
      },
      metadata: {
        icon: 'layers',
        color: '#8B5CF6',
        order: 22,
      },
    },
    {
      key: 'COUPONS_GIFT_CARDS',
      name: 'Cupons/Gift Cards',
      description: 'Permite que clientes usem cupons e gift cards',
      category: FeatureCategory.CUSTOMER,
      minPlanRequired: OrganizationPlan.BASIC,
      defaultLimits: {
        allowSelfService: true,
        allowMultipleCoupons: true,
        allowGiftCardRedemption: true,
      },
      metadata: {
        icon: 'tag',
        color: '#F97316',
        order: 23,
      },
    },
    {
      key: 'DYNAMIC_PRICING',
      name: 'Preço Dinâmico',
      description: 'Permite que clientes vejam preços dinâmicos',
      category: FeatureCategory.SERVICES,
      minPlanRequired: OrganizationPlan.ENTERPRISE,
      defaultLimits: {
        allowSelfService: true,
        showPersonalizedPricing: true,
        showPromotions: true,
      },
      metadata: {
        icon: 'trending-up',
        color: '#10B981',
        order: 24,
      },
    },
    {
      key: 'DIGITAL_SIGNATURE',
      name: 'Assinatura Digital',
      description: 'Permite que clientes assinem documentos digitalmente',
      category: FeatureCategory.OPERATIONS,
      minPlanRequired: OrganizationPlan.PRO,
      defaultLimits: {
        allowSelfService: true,
        allowMultipleSignatures: true,
        requireVerification: true,
      },
      metadata: {
        icon: 'pen-tool',
        color: '#6366F1',
        order: 25,
      },
    },
    {
      key: 'CUSTOMER_APP',
      name: 'App/Portal do Tutor',
      description: 'App móvel completo para clientes',
      category: FeatureCategory.CUSTOMER,
      minPlanRequired: OrganizationPlan.ENTERPRISE,
      defaultLimits: {
        allowSelfService: true,
        allowPushNotifications: true,
        allowOfflineMode: false,
      },
      metadata: {
        icon: 'smartphone',
        color: '#3B82F6',
        order: 26,
      },
    },
    {
      key: 'TELEMEDICINE',
      name: 'Telemedicina',
      description: 'Permite consultas veterinárias online',
      category: FeatureCategory.SERVICES,
      minPlanRequired: OrganizationPlan.ENTERPRISE,
      defaultLimits: {
        allowSelfService: true,
        maxConsultationsPerMonth: 5,
        requireAppointment: true,
      },
      metadata: {
        icon: 'video-call',
        color: '#059669',
        order: 27,
      },
    },
    {
      key: 'NUTRITIONAL_CATALOG',
      name: 'Catálogo Nutricional',
      description: 'Permite que clientes vejam planos nutricionais',
      category: FeatureCategory.SERVICES,
      minPlanRequired: OrganizationPlan.PRO,
      defaultLimits: {
        allowSelfService: true,
        showPersonalizedPlans: true,
        allowPlanModification: false,
      },
      metadata: {
        icon: 'utensils',
        color: '#F59E0B',
        order: 28,
      },
    },
    {
      key: 'ENVIRONMENTAL_ENRICHMENT',
      name: 'Enriquecimento Ambiental',
      description: 'Permite que clientes vejam atividades do pet',
      category: FeatureCategory.CUSTOMER,
      minPlanRequired: OrganizationPlan.PRO,
      defaultLimits: {
        allowSelfService: true,
        showActivityHistory: true,
        allowActivityRequests: true,
      },
      metadata: {
        icon: 'activity',
        color: '#84CC16',
        order: 29,
      },
    },
    {
      key: 'REPUTATION_MANAGEMENT',
      name: 'Gestão de Reputação',
      description: 'Permite que clientes deixem reviews públicos',
      category: FeatureCategory.CUSTOMER,
      minPlanRequired: OrganizationPlan.BASIC,
      defaultLimits: {
        allowSelfService: true,
        allowPublicReviews: true,
        allowResponseToReviews: true,
      },
      metadata: {
        icon: 'message-circle',
        color: '#EC4899',
        order: 30,
      },
    },
  ];

  for (const featureData of divisibleFeatures) {
    const existingFeature = await featureRepository.findOne({
      where: { key: featureData.key },
    });

    if (!existingFeature) {
      const feature = featureRepository.create(featureData);
      await featureRepository.save(feature);
      console.log(`✅ Created divisible feature: ${featureData.name}`);
    } else {
      console.log(`⚠️ Feature already exists: ${featureData.name}`);
    }
  }

  console.log(`🎉 Divisible features seeding completed!`);
}
