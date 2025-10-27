import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

export async function seedSuperAdmin(dataSource: DataSource) {
  console.log('\n🔐 Criando SUPER_ADMIN...');
  
  // Verificar se SUPER_ADMIN já existe
  const existingSuperAdmin = await dataSource.query(
    'SELECT id FROM users WHERE email = ?',
    ['superadmin@superpet.com']
  );
  
  if (existingSuperAdmin.length > 0) {
    console.log('   ⚠️  SUPER_ADMIN já existe');
    return;
  }
  
  // Criar usuário SUPER_ADMIN
  const passwordHash = await bcrypt.hash('superadmin123', 10);
  
  await dataSource.query(
    `INSERT INTO users (id, organization_id, email, name, password, status, role, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      '00000000-0000-0000-0000-000000000000',
      null, // SUPER_ADMIN não pertence a nenhuma organização
      'superadmin@superpet.com',
      'Super Admin',
      passwordHash,
      'ACTIVE',
      'SUPER_ADMIN'
    ]
  );
  
  // Criar employee SUPER_ADMIN
  await dataSource.query(
    `INSERT INTO employees (id, organization_id, user_id, role, job_title, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      'emp-superadmin',
      '00000000-0000-0000-0000-000000000001', // Use existing organization ID
      '00000000-0000-0000-0000-000000000000',
      'SUPER_ADMIN',
      'OWNER', // Use a valid job_title
      true
    ]
  );
  
  console.log('   ✅ SUPER_ADMIN criado');
  console.log('   📧 Email: superadmin@superpet.com');
  console.log('   🔑 Senha: superadmin123');
}
