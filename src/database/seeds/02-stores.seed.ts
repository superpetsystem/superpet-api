import { DataSource } from 'typeorm';
import { StoreEntity } from '../../stores/entities/store.entity';
import { StoreFeatureEntity, FeatureKey } from '../../stores/entities/store-feature.entity';

const ORGANIZATION_ID = '00000000-0000-0000-0000-000000000001';

export const storesData = [
  {
    id: '00000000-0000-0000-0000-000000000101',
    code: 'MNS-CENTRO',
    name: 'SuperPet - Loja Centro',
    timezone: 'America/Manaus',
    phone: '(92) 3232-1000',
    email: 'centro@superpet.com.br',
    address: {
      street: 'Avenida Eduardo Ribeiro',
      number: '500',
      district: 'Centro',
      city: 'Manaus',
      state: 'AM',
      zip: '69010001',
      country: 'BR',
    },
    openingHours: {
      mon: [['08:00', '12:00'], ['14:00', '18:00']],
      tue: [['08:00', '12:00'], ['14:00', '18:00']],
      wed: [['08:00', '12:00'], ['14:00', '18:00']],
      thu: [['08:00', '12:00'], ['14:00', '18:00']],
      fri: [['08:00', '12:00'], ['14:00', '18:00']],
      sat: [['08:00', '13:00']],
    },
    resourcesCatalog: ['GROOMER', 'TABLE', 'VET_ROOM'],
    capacity: { GROOMER: 3, TABLE: 4, VET_ROOM: 1 },
    active: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    code: 'MNS-VIEIRALVES',
    name: 'SuperPet - Vieiralves',
    timezone: 'America/Manaus',
    phone: '(92) 3232-2000',
    email: 'vieiralves@superpet.com.br',
    address: {
      street: 'Avenida Darcy Vargas',
      number: '1200',
      district: 'Parque Dez de Novembro',
      city: 'Manaus',
      state: 'AM',
      zip: '69055035',
      country: 'BR',
    },
    openingHours: {
      mon: [['08:00', '20:00']],
      tue: [['08:00', '20:00']],
      wed: [['08:00', '20:00']],
      thu: [['08:00', '20:00']],
      fri: [['08:00', '20:00']],
      sat: [['08:00', '18:00']],
      sun: [['09:00', '13:00']],
    },
    resourcesCatalog: ['GROOMER', 'TABLE', 'VET_ROOM', 'SURGERY_ROOM'],
    capacity: { GROOMER: 5, TABLE: 6, VET_ROOM: 2, SURGERY_ROOM: 1 },
    active: true,
  },
];

export async function seedStores(dataSource: DataSource): Promise<StoreEntity[]> {
  console.log('\n🏪 Criando lojas...');

  const storeRepository = dataSource.getRepository(StoreEntity);
  const featureRepository = dataSource.getRepository(StoreFeatureEntity);

  // Verificar se já existem
  const existingCount = await storeRepository.count({ where: { organizationId: ORGANIZATION_ID } });
  if (existingCount > 0) {
    console.log(`⚠️  Já existem ${existingCount} lojas. Pulando seed.`);
    return storeRepository.find({ where: { organizationId: ORGANIZATION_ID } });
  }

  const stores = storesData.map((data) =>
    storeRepository.create({
      ...data,
      organizationId: ORGANIZATION_ID,
    }),
  );

  const savedStores = await storeRepository.save(stores);
  console.log(`✅ ${savedStores.length} lojas criadas`);

  // Criar features padrão para cada loja
  console.log('\n⚙️  Configurando features...');
  
  for (const store of savedStores) {
    const features = [
      { storeId: store.id, featureKey: 'SERVICE_CATALOG', enabled: true, limits: null },
      { storeId: store.id, featureKey: 'CUSTOM_SERVICE', enabled: true, limits: null },
      { storeId: store.id, featureKey: 'TELEPICKUP', enabled: true, limits: { dailyPickups: 30 } },
      { storeId: store.id, featureKey: 'LIVE_CAM', enabled: true, limits: { maxActiveStreams: 5 } },
      { storeId: store.id, featureKey: 'INVENTORY_MANAGEMENT', enabled: true, limits: { maxProducts: 1000 } },
      { storeId: store.id, featureKey: 'REPORTS_DASHBOARD', enabled: true, limits: { exportReportsPerMonth: 50 } },
      { storeId: store.id, featureKey: 'ONLINE_BOOKING', enabled: true, limits: { maxBookingsPerDay: 100 } },
      { storeId: store.id, featureKey: 'VETERINARY_RECORDS', enabled: true, limits: { maxRecordsPerPet: 1000 } },
    ];

    const featureEntities = features.map((f) => featureRepository.create(f));
    await featureRepository.save(featureEntities);
    
    console.log(`   ✅ ${store.name}: 8 features habilitadas`);
  }

  return savedStores;
}


