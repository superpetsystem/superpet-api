// Script para criar SUPER_ADMIN no banco de dados
require('dotenv').config({ path: './env/local.env' });
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function setupSuperUser() {
  console.log('\n' + '='.repeat(70));
  console.log('CONFIGURANDO SUPER ADMIN');
  console.log('='.repeat(70) + '\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    const userId = '00000000-0000-0000-0000-000000000099';
    const employeeId = '00000000-0000-0000-0000-000000000099';
    const organizationId = '00000000-0000-0000-0000-000000000001';
    const email = 'superadmin@superpet.com.br';
    const name = 'Super Admin';
    const password = 'superadmin123';
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('📊 Dados do Super Admin:');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Employee ID: ${employeeId}`);
    console.log('\n');

    // 1. Verificar se usuário já existe
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (existingUsers.length > 0) {
      console.log('⚠️  Usuário já existe, atualizando...');
      await connection.execute(
        `UPDATE users SET 
          email = ?,
          name = ?,
          password = ?,
          status = 'ACTIVE',
          updated_at = NOW()
        WHERE id = ?`,
        [email, name, passwordHash, userId]
      );
    } else {
      console.log('✅ Criando novo usuário...');
      await connection.execute(
        `INSERT INTO users (id, organization_id, email, name, password, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'ACTIVE', NOW(), NOW())`,
        [userId, organizationId, email, name, passwordHash]
      );
    }

    // 2. Verificar se employee já existe
    const [existingEmployees] = await connection.execute(
      'SELECT id FROM employees WHERE id = ?',
      [employeeId]
    );

    if (existingEmployees.length > 0) {
      console.log('⚠️  Employee já existe, atualizando...');
      await connection.execute(
        `UPDATE employees SET 
          role = 'SUPER_ADMIN',
          active = 1,
          updated_at = NOW()
        WHERE id = ?`,
        [employeeId]
      );
    } else {
      console.log('✅ Criando novo employee...');
      await connection.execute(
        `INSERT INTO employees (id, organization_id, user_id, role, active, created_at, updated_at)
        VALUES (?, ?, ?, 'SUPER_ADMIN', 1, NOW(), NOW())`,
        [employeeId, organizationId, userId]
      );
    }

    // 3. Verificar se foi criado corretamente
    const [result] = await connection.execute(
      `SELECT 
        u.id as user_id,
        u.email,
        u.name,
        u.status,
        e.id as employee_id,
        e.role,
        e.active
      FROM users u
      LEFT JOIN employees e ON e.user_id = u.id
      WHERE u.id = ?`,
      [userId]
    );

    console.log('\n' + '='.repeat(70));
    console.log('✅ SUPER ADMIN CONFIGURADO COM SUCESSO!');
    console.log('='.repeat(70));
    console.log('\n📋 Detalhes:');
    console.log(result[0]);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Erro ao criar super admin:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

setupSuperUser()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

