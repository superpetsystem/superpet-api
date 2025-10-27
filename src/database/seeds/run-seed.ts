import dataSource from '../data-source';
import { seedOrganization } from './01-organization.seed';
import { seedFeatures } from './features.seed';
import { seedDivisibleFeatures } from './divisible-features.seed';
import { seedStores } from './02-stores.seed';
import { seedServices } from './03-services.seed';
import { seedSuperAdmin } from './04-superadmin.seed';

async function runSeeds() {
  console.log('=' .repeat(70));
  console.log('🌱 INICIANDO SEED DO BANCO DE DADOS');
  console.log('=' .repeat(70));

  try {
    await dataSource.initialize();
    console.log('\n✅ Conexão estabelecida com o banco de dados');

    // 1. Organização
    console.log('\n' + '-'.repeat(70));
    console.log('ETAPA 1: Organização');
    console.log('-'.repeat(70));
    await seedOrganization(dataSource);

    // 2. SUPER_ADMIN
    console.log('\n' + '-'.repeat(70));
    console.log('ETAPA 2: SUPER_ADMIN');
    console.log('-'.repeat(70));
    await seedSuperAdmin(dataSource);

    // 3. Features (Catálogo de Features)
    console.log('\n' + '-'.repeat(70));
    console.log('ETAPA 3: Features do Sistema');
    console.log('-'.repeat(70));
    console.log('\n💡 Criando features disponíveis...');
    await seedFeatures(dataSource);

    // 3.1. Features Divisíveis (SaaS)
    console.log('\n' + '-'.repeat(70));
    console.log('ETAPA 3.1: Features Divisíveis (SaaS)');
    console.log('-'.repeat(70));
    console.log('\n💡 Criando features divisíveis entre Loja e Cliente...');
    await seedDivisibleFeatures(dataSource);

    // 4. Stores + Habilitar Features
    console.log('\n' + '-'.repeat(70));
    console.log('ETAPA 4: Lojas e Features');
    console.log('-'.repeat(70));
    await seedStores(dataSource);

    // 5. Services
    console.log('\n' + '-'.repeat(70));
    console.log('ETAPA 5: Serviços');
    console.log('-'.repeat(70));
    await seedServices(dataSource);

    console.log('\n' + '='.repeat(70));
    console.log('✅ SEED COMPLETADO COM SUCESSO!');
    console.log('='.repeat(70));
    console.log('\n📊 Resumo:');
    console.log('   • 1 Organização (SuperPet Demo)');
    console.log('   • 4 Features básicas + 30 Features divisíveis');
    console.log('   • 2 Lojas (Centro, Vieiralves)');
    console.log('   • 4 Features habilitadas por loja');
    console.log('   • 11 Serviços básicos (banho, tosa, vet, hotel, daycare, emergência)');
    console.log('\n💡 Próximos passos:');
    console.log('   1. npm run start:local');
    console.log('   2. POST /auth/register - Criar primeiro usuário');
    console.log('   3. POST /auth/login - Fazer login');
    console.log('   4. Testar endpoints com Bearer token');
    console.log('   5. Configurar features por loja via API\n');
    
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ ERRO AO EXECUTAR SEED');
    console.error('='.repeat(70));
    console.error(error);
    await dataSource.destroy();
    process.exit(1);
  }
}

runSeeds();


