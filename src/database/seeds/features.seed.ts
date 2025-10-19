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

