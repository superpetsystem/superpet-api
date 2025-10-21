import { DataSource } from 'typeorm';
import { OrganizationEntity, OrganizationStatus, OrganizationPlan } from '../../organizations/entities/organization.entity';

export async function seedOrganization(dataSource: DataSource): Promise<OrganizationEntity> {
  console.log('🏢 Criando organização padrão...');

  const orgRepository = dataSource.getRepository(OrganizationEntity);

  // Verificar se já existe
  const existing = await orgRepository.findOne({
    where: { id: '00000000-0000-0000-0000-000000000001' },
  });

  if (existing) {
    console.log(`⚠️  Organização já existe: ${existing.name}`);
    return existing;
  }

  const org = orgRepository.create({
    id: '00000000-0000-0000-0000-000000000001',
    name: 'SuperPet - Organização Demo',
    slug: 'superpet-demo',
    status: OrganizationStatus.ACTIVE,
    plan: OrganizationPlan.PRO,
    limits: {
      employees: 1000, // Aumentado para suportar testes
      stores: 200, // Aumentado para suportar testes
      monthlyAppointments: 10000,
    },
  });

  const saved = await orgRepository.save(org);
  console.log(`✅ Organização criada: ${saved.name} (${saved.slug})`);
  console.log(`   ID: ${saved.id}`);
  console.log(`   Plano: ${saved.plan}`);
  console.log(`   Limites:`, saved.limits);

  return saved;
}


