const { execSync } = require('child_process');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function runFromScratch() {
  console.log('\n🚀 PREPARANDO AMBIENTE DE TESTE DO ZERO\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // 1. Resetar banco de dados
    console.log('📍 PASSO 1: Resetando banco de dados...\n');
    await resetDatabase();

    // 2. Criar SUPER_ADMIN
    console.log('\n📍 PASSO 2: Criando SUPER_ADMIN...\n');
    await createSuperAdmin();

    // 3. Aguardar um pouco para garantir que tudo está pronto
    console.log('\n⏳ Aguardando estabilização do ambiente...');
    await sleep(2000);

    // 4. Rodar testes
    console.log('\n📍 PASSO 3: Rodando todos os testes...\n');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    try {
      execSync('node test/automation/run-all-tests.js', {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
      console.log('\n✅ TODOS OS TESTES PASSARAM! 🎉\n');
    } catch (error) {
      console.log('\n❌ ALGUNS TESTES FALHARAM\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Erro ao preparar ambiente:', error.message);
    process.exit(1);
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
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 0`);
    
    const tables = [
      // Novos módulos
      'bookings',
      'veterinary_vaccinations',
      'veterinary_records',
      'stock_transfers',
      'stock_movements',
      'stock_alerts',
      'products',
      // Módulos existentes
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
      'organizations',
    ];

    console.log('   🗑️  Deletando dados das tabelas...');
    for (const table of tables) {
      try {
        await connection.execute(`DELETE FROM ${table}`);
        console.log(`      ✅ ${table}`);
      } catch (err) {
        // Tabela pode não existir, continuar
        console.log(`      ⚠️  ${table} (não existe ou erro)`);
      }
    }

    await connection.execute(`SET FOREIGN_KEY_CHECKS = 1`);
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
    const email = 'superadmin@superpet.com.br';
    const password = 'Super@2024!Admin';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('   👤 Criando SUPER_ADMIN...');
    console.log(`      Email: ${email}`);
    console.log(`      Senha: ${password}`);

    await connection.execute(
      `INSERT INTO users (
        id,
        organization_id,
        email, 
        password, 
        name, 
        role, 
        email_verified, 
        created_at, 
        updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        NULL,
        ?,
        ?,
        'Super Admin',
        'SUPER_ADMIN',
        true,
        NOW(),
        NOW()
      )`,
      [email, hashedPassword]
    );

    console.log('\n   ✅ SUPER_ADMIN criado com sucesso!');

    // Criar organização padrão para testes
    console.log('\n   🏢 Criando organização padrão para testes...');
    await connection.execute(
      `INSERT INTO organizations (
        id,
        name,
        slug,
        plan,
        limits,
        created_at,
        updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000001',
        'Default Organization',
        'default-org',
        'FREE',
        '{"employees": 10, "stores": 3, "monthlyAppointments": 100}',
        NOW(),
        NOW()
      )`
    );

    console.log('   ✅ Organização padrão criada!');

  } finally {
    await connection.end();
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Executar
runFromScratch()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

