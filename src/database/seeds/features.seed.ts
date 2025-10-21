import { DataSource } from 'typeorm';
import { FeatureEntity, FeatureCategory, OrganizationPlan } from '../../stores/entities/feature.entity';

export async function seedFeatures(dataSource: DataSource): Promise<void> {
  const featureRepository = dataSource.getRepository(FeatureEntity);

  const features = [
    {
      id: '00000000-0000-0000-0000-000000000F01',
      key: 'SERVICE_CATALOG',
      name: 'Catálogo de Serviços',
      description: 'Gerenciamento do catálogo de serviços oferecidos pela loja',
      category: FeatureCategory.SERVICES,
      minPlanRequired: OrganizationPlan.FREE,
      active: true,
      defaultLimits: {},
      metadata: {
        icon: 'calendar',
        color: '#4CAF50',
        displayOrder: 1,
      },
    },
    {
      id: '00000000-0000-0000-0000-000000000F02',
      key: 'CUSTOM_SERVICE',
      name: 'Serviços Customizados',
      description: 'Permite criar preços e configurações específicas por loja',
      category: FeatureCategory.SERVICES,
      minPlanRequired: OrganizationPlan.BASIC,
      active: true,
      defaultLimits: {},
      metadata: {
        icon: 'edit',
        color: '#2196F3',
        displayOrder: 2,
      },
    },
    {
      id: '00000000-0000-0000-0000-000000000F03',
      key: 'TELEPICKUP',
      name: 'Busca e Entrega',
      description: 'Sistema de agendamento de busca e entrega de pets',
      category: FeatureCategory.OPERATIONS,
      minPlanRequired: OrganizationPlan.PRO,
      active: true,
      defaultLimits: {
        dailyPickups: 20,
        maxDistanceKm: 10,
      },
      metadata: {
        icon: 'truck',
        color: '#FF9800',
        displayOrder: 3,
      },
    },
    {
      id: '00000000-0000-0000-0000-000000000F04',
      key: 'LIVE_CAM',
      name: 'Câmera ao Vivo',
      description: 'Transmissão ao vivo para donos acompanharem seus pets',
      category: FeatureCategory.CUSTOMER,
      minPlanRequired: OrganizationPlan.PRO,
      active: true,
      defaultLimits: {
        maxConcurrentStreams: 5,
        maxStreamDurationHours: 24,
      },
      metadata: {
        icon: 'video',
        color: '#E91E63',
        displayOrder: 4,
      },
    },
    {
      id: '00000000-0000-0000-0000-000000000F05',
      key: 'INVENTORY_MANAGEMENT',
      name: 'Gestão de Estoque',
      description: 'Controle completo de estoque de produtos e insumos',
      category: FeatureCategory.OPERATIONS,
      minPlanRequired: OrganizationPlan.BASIC,
      active: true,
      defaultLimits: {
        maxProducts: 1000,
        maxMovementsPerMonth: 5000,
      },
      metadata: {
        icon: 'warehouse',
        color: '#9C27B0',
        displayOrder: 5,
      },
    },
    {
      id: '00000000-0000-0000-0000-000000000F06',
      key: 'REPORTS_DASHBOARD',
      name: 'Relatórios e Dashboard',
      description: 'Relatórios gerenciais e dashboard com KPIs',
      category: FeatureCategory.ANALYTICS,
      minPlanRequired: OrganizationPlan.PRO,
      active: true,
      defaultLimits: {
        exportReportsPerMonth: 50,
      },
      metadata: {
        icon: 'chart-bar',
        color: '#3F51B5',
        displayOrder: 6,
      },
    },
    {
      id: '00000000-0000-0000-0000-000000000F07',
      key: 'ONLINE_BOOKING',
      name: 'Agendamento Online',
      description: 'Sistema de agendamento online para clientes',
      category: FeatureCategory.CUSTOMER,
      minPlanRequired: OrganizationPlan.BASIC,
      active: true,
      defaultLimits: {
        maxBookingsPerDay: 100,
        advanceBookingDays: 30,
      },
      metadata: {
        icon: 'calendar-check',
        color: '#00BCD4',
        displayOrder: 7,
      },
    },
    {
      id: '00000000-0000-0000-0000-000000000F08',
      key: 'VETERINARY_RECORDS',
      name: 'Prontuários Veterinários',
      description: 'Sistema completo de prontuários médicos e vacinação',
      category: FeatureCategory.SERVICES,
      minPlanRequired: OrganizationPlan.PRO,
      active: true,
      defaultLimits: {
        maxRecordsPerPet: 1000,
      },
      metadata: {
        icon: 'file-medical',
        color: '#F44336',
        displayOrder: 8,
      },
    },
  ];

  for (const featureData of features) {
    const existing = await featureRepository.findOne({
      where: { key: featureData.key },
    });

    if (!existing) {
      const feature = featureRepository.create(featureData);
      await featureRepository.save(feature);
      console.log(`   ✅ Feature criada: ${featureData.name} (${featureData.key})`);
    } else {
      console.log(`   ⚠️  Feature já existe: ${featureData.key}`);
    }
  }
}

