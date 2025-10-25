const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

let superAdminToken = null;
let ownerToken = null;
let staffToken = null;
let viewerToken = null;
let storeId = null;
let otherStoreId = null;
let staffEmployeeId = null;

console.log('🔒 Iniciando testes de Erros de Permissão (403)\n');

// Setup
async function setup() {
  console.log('🔧 Setup: Login como SUPER_ADMIN...');
  const { loginAsSuperAdmin } = require('../helpers/superadmin-login.js');
  const result = await loginAsSuperAdmin();
  superAdminToken = result.accessToken;
  console.log('✅ Autenticado como SUPER_ADMIN');
  
  // Criar organização separada para evitar limites
  console.log('🔧 Setup: Criando organização separada...');
  let testOrgId;
  try {
    const orgResponse = await axios.post(`${BASE_URL}/admin/organizations`, {
      name: 'Permission Test Org',
      slug: `perm-test-${Date.now()}`,
      plan: 'PRO',
    }, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    testOrgId = orgResponse.data.id;
    console.log('✅ Organização criada:', testOrgId);
  } catch (error) {
    console.error('❌ Erro ao criar organização:', error.response?.data || error.message);
    throw error;
  }
  
  // Criar OWNER
  console.log('🔧 Setup: Criando OWNER...');
  const ownerEmail = `owner_perm_${Date.now()}@test.com`;
  try {
    const bcrypt = require('bcrypt');
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'root',
      database: 'superpet_test',
    });

    const passwordHash = await bcrypt.hash('senha123', 10);
    const userId = 'user-perm-' + Date.now();
    
    await connection.execute(
      `INSERT INTO users (id, organization_id, email, name, password, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE', NOW(), NOW())`,
      [userId, testOrgId, ownerEmail, 'Owner Perm', passwordHash]
    );
    
    await connection.execute(
      `INSERT INTO employees (id, organization_id, user_id, role, job_title, active, created_at, updated_at)
       VALUES (?, ?, ?, 'OWNER', 'OWNER', 1, NOW(), NOW())`,
      ['emp-' + userId, testOrgId, userId]
    );
    
    await connection.end();
    console.log('✅ OWNER criado');
  } catch (error) {
    console.error('❌ Erro ao criar OWNER:', error.message);
    throw error;
  }

  console.log('🔧 Setup: Fazendo login do OWNER...');
  try {
    const loginOwner = await axios.post(`${BASE_URL}/auth/login`, {
      email: ownerEmail,
      password: 'senha123',
    });
    ownerToken = loginOwner.data.access_token;
    console.log('✅ OWNER logado');
  } catch (error) {
    console.error('❌ Erro ao fazer login do OWNER:', error.response?.data || error.message);
    throw error;
  }
  
  // Criar STAFF
  console.log('🔧 Setup: Criando STAFF...');
  try {
    const staffResponse = await axios.post(`${BASE_URL}/employees`, {
      email: `staff_perm_${Date.now()}@test.com`,
      name: 'Staff Perm',
      password: 'senha123',
      role: 'STAFF',
      jobTitle: 'GROOMER',
    }, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    
    staffEmployeeId = staffResponse.data.id;
    console.log('✅ STAFF criado');
  } catch (error) {
    console.error('❌ Erro ao criar STAFF:', error.response?.data || error.message);
    throw error;
  }
  
  const loginStaff = await axios.post(`${BASE_URL}/auth/login`, {
    email: `staff_perm_${Date.now() - 1000}@test.com`,
    password: 'senha123',
  }).catch(() => null);
  
  if (loginStaff) {
    staffToken = loginStaff.data.access_token;
  }
  
  // Criar 2 stores
  const store1 = await axios.post(`${BASE_URL}/stores`, {
    code: `STORE_PERM_1_${Date.now()}`,
    name: 'Store Permission Test 1',
    timezone: 'America/Manaus',
  }, {
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  storeId = store1.data.id;
  
  const store2 = await axios.post(`${BASE_URL}/stores`, {
    code: `STORE_PERM_2_${Date.now()}`,
    name: 'Store Permission Test 2',
    timezone: 'America/Manaus',
  }, {
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  otherStoreId = store2.data.id;
  
  console.log('✅ Setup completo\n');
}

// Test 1: VIEWER não pode criar (403)
async function test1_ViewerCannotCreate() {
  console.log('Test 1: POST /employees (VIEWER tenta criar - deve falhar)');
  
  // Criar VIEWER
  const viewerEmail = `viewer_${Date.now()}@test.com`;
  await axios.post(`${BASE_URL}/employees`, {
    email: viewerEmail,
    name: 'Viewer Test',
    password: 'senha123',
    role: 'VIEWER',
    jobTitle: 'OTHER',
  }, {
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  
  const loginViewer = await axios.post(`${BASE_URL}/auth/login`, {
    email: viewerEmail,
    password: 'senha123',
  });
  viewerToken = loginViewer.data.access_token;
  
  try {
    await axios.post(`${BASE_URL}/employees`, {
      email: `new_${Date.now()}@test.com`,
      name: 'New Employee',
      password: 'senha123',
      role: 'STAFF',
    }, {
      headers: { Authorization: `Bearer ${viewerToken}` },
    });

    throw new Error('Deveria ter sido bloqueado!');
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('   ✅ VIEWER bloqueado corretamente (403)');
      console.log(`   ✅ Mensagem: ${error.response.data.message}`);
    } else if (error.message.includes('bloqueado')) {
      throw error;
    } else {
      console.error('   ❌ Erro inesperado:', error.message);
      throw error;
    }
  }
}

// Test 2: Acesso sem employee (403)
async function test2_NoEmployeeAccess() {
  console.log('\nTest 2: POST /stores (usuário sem employee - deve falhar)');
  
  // Criar usuário puro (sem employee)
  const pureUserEmail = `pureuser_${Date.now()}@test.com`;
  const mysql = require('mysql2/promise');
  const bcrypt = require('bcrypt');
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'superpet_test',
  });

  const passwordHash = await bcrypt.hash('senha123', 10);
  const userId = 'pure-user-' + Date.now();
  
  await connection.execute(
    `INSERT INTO users (id, organization_id, email, name, password, status, created_at, updated_at)
     VALUES (?, '00000000-0000-0000-0000-000000000001', ?, 'Pure User', ?, 'ACTIVE', NOW(), NOW())`,
    [userId, pureUserEmail, passwordHash]
  );
  
  await connection.end();
  
  const loginPure = await axios.post(`${BASE_URL}/auth/login`, {
    email: pureUserEmail,
    password: 'senha123',
  });
  const pureToken = loginPure.data.access_token;
  
  try {
    await axios.post(`${BASE_URL}/stores`, {
      code: `FAIL_${Date.now()}`,
      name: 'Should Fail',
      timezone: 'America/Manaus',
    }, {
      headers: { Authorization: `Bearer ${pureToken}` },
    });

    throw new Error('Deveria ter sido bloqueado!');
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('   ✅ Usuário sem employee bloqueado (403)');
      console.log(`   ✅ Mensagem: ${error.response.data.message}`);
    } else if (error.message.includes('bloqueado')) {
      throw error;
    } else {
      console.error('   ❌ Erro inesperado:', error.message);
      throw error;
    }
  }
}

async function runAllTests() {
  console.log('=' .repeat(70));
  console.log('🧪 TESTES DE ERROS DE PERMISSÃO (403)');
  console.log('=' .repeat(70));

  try {
    await setup();
    await test1_ViewerCannotCreate();
    await test2_NoEmployeeAccess();

    console.log('\n' + '='.repeat(70));
    console.log('✅ TODOS OS TESTES DE PERMISSÃO PASSARAM!');
    console.log('='.repeat(70));
    console.log('\n📊 Resumo:');
    console.log('   • 2 testes executados');
    console.log('   • Erros 403: ✅ VALIDADOS');
    console.log('   • Permissões: ✅ FUNCIONANDO\n');

    return { success: true, totalTests: 2 };
  } catch (error) {
    console.error('\n❌ Falha nos testes de Permissão');
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runAllTests };

