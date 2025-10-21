const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './env/local.env' });

async function createSuperAdmin() {
  console.log('\n🔒 Criando SUPER_ADMIN via SQL...\n');

  console.log(`🔍 Conectando ao banco: ${process.env.DB_DATABASE || 'superpet_local'}\n`);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'superpet_local',
  });

  try {
    // Gerar hash da senha
    const password = 'Super@2024!Admin';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar ou atualizar SUPER_ADMIN
    await connection.execute(`
      INSERT INTO users (id, organization_id, email, name, password, status, role, email_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE role = 'SUPER_ADMIN', password = VALUES(password), updated_at = NOW()
    `, [
      '00000000-0000-0000-0000-000000000099',
      '00000000-0000-0000-0000-000000000001',
      'superadmin@superpet.com',
      'Super Admin',
      hashedPassword,
      'ACTIVE',
      'SUPER_ADMIN',
      1
    ]);

    console.log('✅ SUPER_ADMIN criado/atualizado com sucesso!\n');
    console.log('📋 Credenciais:');
    console.log('   Email:    superadmin@superpet.com');
    console.log('   Password: Super@2024!Admin');
    console.log('   Role:     SUPER_ADMIN');
    console.log('   OrgID:    00000000-0000-0000-0000-000000000001\n');
    console.log('🔒 ATENÇÃO: Esta é a ÚNICA forma de criar SUPER_ADMIN!\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
  }
}

createSuperAdmin()
  .then(() => {
    console.log('✅ Pronto! Agora pode usar os endpoints /v1/admin/*\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Falha:', error);
    process.exit(1);
  });

