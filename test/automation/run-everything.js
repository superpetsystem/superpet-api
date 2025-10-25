const { execSync } = require('child_process');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function runEverything() {
  console.log('\n🚀 EXECUTANDO TUDO: RESET + MIGRATIONS + SEED + TODOS OS TESTES');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                    SUPERPET API - EXECUÇÃO COMPLETA                ║');
  console.log('║           Reset DB + Migrations + Seed + 134 Testes              ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    // 1. Resetar banco de dados
    console.log('📍 PASSO 1: Resetando banco de dados...\n');
    await resetDatabase();

    // 2. Executar migrations
    console.log('\n📍 PASSO 2: Executando migrations...\n');
    await runMigrations();

    // 3. Criar SUPER_ADMIN
    console.log('\n📍 PASSO 3: Criando SUPER_ADMIN...\n');
    await createSuperAdmin();

    // 4. Aguardar estabilização
    console.log('\n⏳ Aguardando estabilização do ambiente...');
    await sleep(2000);

    // 5. Executar todos os testes
    console.log('\n📍 PASSO 4: Executando todos os 134 testes...\n');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    try {
      execSync('node test/automation/run-all-tests.js', {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
      console.log('\n🎉 EXECUÇÃO COMPLETA FINALIZADA COM SUCESSO! 🎉\n');
    } catch (error) {
      console.log('\n⚠️  ALGUNS TESTES FALHARAM - REVISAR IMPLEMENTAÇÃO\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Erro na execução completa:', error.message);
    process.exit(1);
  }
}

async function runMigrations() {
  try {
    console.log('   🔄 Executando migrations do TypeORM...');
    
    // Executar migrations usando o comando do NestJS
    execSync('npm run database:migration:run:local', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    
    console.log('   ✅ Migrations executadas com sucesso!');
  } catch (error) {
    console.error('   ❌ Erro ao executar migrations:', error.message);
    throw error;
  }
}

async function resetDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'superpet_test',
  });

  try {
    console.log('   🗑️  Deletando dados das tabelas...');
    
    const tables = [
      'bookings',
      'veterinary_vaccinations',
      'veterinary_records',
      'stock_transfers',
      'stock_movements',
      'stock_alerts',
      'products',
      'live_cam_streams',
      'pickups',
      'store_features',
      'custom_services',
      'services',
      'appointments',
      'pets',
      'customer_addresses',
      'customers',
      'employee_stores',
      'employees',
      'users',
      'stores',
      'token_blacklist',
      'organizations'
    ];

    for (const table of tables) {
      try {
        await connection.execute(`DELETE FROM ${table}`);
        console.log(`      ✅ ${table}`);
      } catch (error) {
        console.log(`      ⚠️  ${table} (não existe ou erro)`);
      }
    }

    console.log('\n   ✅ Banco de dados limpo com sucesso!');
  } finally {
    await connection.end();
  }
}

async function createSuperAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'superpet_test',
  });

  try {
    console.log('   👤 Criando SUPER_ADMIN...');
    console.log('      Email: superadmin@superpet.com');
    console.log('      Senha: Super@2024!Admin');

    const hashedPassword = await bcrypt.hash('Super@2024!Admin', 10);
    const userId = '00000000-0000-0000-0000-000000000000';
    const employeeId = '00000000-0000-0000-0000-000000000000';

    // Criar usuário SUPER_ADMIN
    await connection.execute(`
      INSERT INTO users (id, email, name, password, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      email = VALUES(email),
      name = VALUES(name),
      password = VALUES(password),
      role = VALUES(role),
      status = VALUES(status)
    `, [userId, 'superadmin@superpet.com', 'Super Admin', hashedPassword, 'SUPER_ADMIN', 'ACTIVE']);

    // Criar employee SUPER_ADMIN
    await connection.execute(`
      INSERT INTO employees (id, user_id, organization_id, role, job_title, active)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      user_id = VALUES(user_id),
      organization_id = VALUES(organization_id),
      role = VALUES(role),
      job_title = VALUES(job_title),
      active = VALUES(active)
    `, [employeeId, userId, '00000000-0000-0000-0000-000000000001', 'SUPER_ADMIN', 'OWNER', 1]);

    console.log('\n   ✅ SUPER_ADMIN criado com sucesso!');

    console.log('\n   🏢 Criando organização padrão para testes...');
    
    // Criar organização padrão
    await connection.execute(`
      INSERT INTO organizations (id, name, slug, plan, limits, status)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      slug = VALUES(slug),
      plan = VALUES(plan),
      limits = VALUES(limits),
      status = VALUES(status)
    `, [
      '00000000-0000-0000-0000-000000000001',
      'Organização Padrão',
      'org-padrao',
      'PRO',
      JSON.stringify({ employees: 50, stores: 10, monthlyAppointments: 5000 }),
      'ACTIVE'
    ]);

    console.log('   ✅ Organização padrão criada!');

  } finally {
    await connection.end();
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Executar se chamado diretamente
if (require.main === module) {
  runEverything()
    .then(() => {
      console.log('\n✅ Execução completa finalizada com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Execução completa falhou:', error.message);
      process.exit(1);
    });
}

module.exports = { runEverything };
