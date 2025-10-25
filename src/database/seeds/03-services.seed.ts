import { DataSource } from 'typeorm';
import { ServiceEntity, ServiceVisibility } from '../../services/entities/service.entity';

const ORGANIZATION_ID = '00000000-0000-0000-0000-000000000001';

export const servicesData = [
  // Banho & Tosa
  {
    code: 'BATH_SMALL',
    name: 'Banho - Porte Pequeno',
    description: 'Banho completo para pets até 10kg',
    durationMinutes: 45,
    bufferBefore: 10,
    bufferAfter: 10,
    resourcesRequired: ['GROOMER', 'TABLE'],
    visibility: ServiceVisibility.PUBLIC,
    priceBaseCents: 4500, // R$ 45,00
    taxCode: 'SERV_BATH',
  },
  {
    code: 'BATH_MEDIUM',
    name: 'Banho - Porte Médio',
    description: 'Banho completo para pets de 10kg a 25kg',
    durationMinutes: 60,
    bufferBefore: 10,
    bufferAfter: 10,
    resourcesRequired: ['GROOMER', 'TABLE'],
    visibility: ServiceVisibility.PUBLIC,
    priceBaseCents: 6500, // R$ 65,00
    taxCode: 'SERV_BATH',
  },
  {
    code: 'BATH_LARGE',
    name: 'Banho - Porte Grande',
    description: 'Banho completo para pets acima de 25kg',
    durationMinutes: 90,
    bufferBefore: 15,
    bufferAfter: 15,
    resourcesRequired: ['GROOMER', 'TABLE'],
    visibility: ServiceVisibility.PUBLIC,
    priceBaseCents: 9500, // R$ 95,00
    taxCode: 'SERV_BATH',
  },
  {
    code: 'GROOM_HYGIENE',
    name: 'Tosa Higiênica',
    description: 'Tosa nas áreas íntimas, patas e face',
    durationMinutes: 30,
    bufferBefore: 5,
    bufferAfter: 5,
    resourcesRequired: ['GROOMER', 'TABLE'],
    visibility: ServiceVisibility.PUBLIC,
    priceBaseCents: 3500, // R$ 35,00
    taxCode: 'SERV_GROOM',
  },
  {
    code: 'GROOM_COMPLETE',
    name: 'Tosa Completa',
    description: 'Tosa completa na máquina ou tesoura',
    durationMinutes: 120,
    bufferBefore: 15,
    bufferAfter: 15,
    resourcesRequired: ['GROOMER', 'TABLE'],
    visibility: ServiceVisibility.PUBLIC,
    priceBaseCents: 12000, // R$ 120,00
    taxCode: 'SERV_GROOM',
  },

  // Veterinária
  {
    code: 'VET_CONSULTATION',
    name: 'Consulta Veterinária',
    description: 'Consulta de rotina com veterinário',
    durationMinutes: 30,
    bufferBefore: 10,
    bufferAfter: 10,
    resourcesRequired: ['VET_ROOM'],
    visibility: ServiceVisibility.PUBLIC,
    priceBaseCents: 15000, // R$ 150,00
    taxCode: 'SERV_VET',
  },
  {
    code: 'VET_VACCINE_V10',
    name: 'Vacinação V10',
    description: 'Vacina V10 para cães',
    durationMinutes: 15,
    bufferBefore: 5,
    bufferAfter: 5,
    resourcesRequired: ['VET_ROOM'],
    visibility: ServiceVisibility.PUBLIC,
    priceBaseCents: 9500, // R$ 95,00
    taxCode: 'SERV_VET',
  },
  {
    code: 'VET_CASTRATION_MALE',
    name: 'Castração - Macho',
    description: 'Cirurgia de castração para machos',
    durationMinutes: 90,
    bufferBefore: 30,
    bufferAfter: 30,
    resourcesRequired: ['SURGERY_ROOM'],
    visibility: ServiceVisibility.PUBLIC,
    priceBaseCents: 40000, // R$ 400,00
    taxCode: 'SERV_SURGERY',
  },

  // Hospedagem
  {
    code: 'HOTEL_STANDARD',
    name: 'Hotel - Suíte Padrão (Diária)',
    description: 'Hospedagem com suíte individual e recreação',
    durationMinutes: 1440,
    bufferBefore: 0,
    bufferAfter: 0,
    resourcesRequired: [],
    visibility: ServiceVisibility.PUBLIC,
    priceBaseCents: 13000, // R$ 130,00
    taxCode: 'SERV_HOTEL',
  },

  // Daycare
  {
    code: 'DAYCARE_FULL',
    name: 'Day Care - Dia Completo',
    description: 'Pet fica o dia todo com recreação e supervisão',
    durationMinutes: 480,
    bufferBefore: 0,
    bufferAfter: 0,
    resourcesRequired: [],
    visibility: ServiceVisibility.PUBLIC,
    priceBaseCents: 8000, // R$ 80,00
    taxCode: 'SERV_DAYCARE',
  },

  // Emergência
  {
    code: 'EMERGENCY_IMMEDIATE',
    name: 'Atendimento Emergencial',
    description: 'Triagem e estabilização de emergência',
    durationMinutes: 60,
    bufferBefore: 0,
    bufferAfter: 30,
    resourcesRequired: ['VET_ROOM'],
    visibility: ServiceVisibility.PUBLIC,
    priceBaseCents: 25000, // R$ 250,00
    taxCode: 'SERV_EMERGENCY',
  },
];

export async function seedServices(dataSource: DataSource): Promise<ServiceEntity[]> {
  console.log('\n💼 Criando serviços básicos...');

  const serviceRepository = dataSource.getRepository(ServiceEntity);

  // Verificar se já existem
  const existingCount = await serviceRepository.count({ where: { organizationId: ORGANIZATION_ID } });
  if (existingCount > 0) {
    console.log(`⚠️  Já existem ${existingCount} serviços. Pulando seed.`);
    return serviceRepository.find({ where: { organizationId: ORGANIZATION_ID } });
  }

  const services = servicesData.map((data) =>
    serviceRepository.create({
      ...data,
      organizationId: ORGANIZATION_ID,
      active: true,
      addons: null,
    }),
  );

  const savedServices = await serviceRepository.save(services);
  console.log(`✅ ${savedServices.length} serviços criados`);

  savedServices.forEach((service, index) => {
    const price = (service.priceBaseCents / 100).toFixed(2);
    console.log(`   ${index + 1}. ${service.name} - R$ ${price} (${service.durationMinutes}min)`);
  });

  return savedServices;
}




