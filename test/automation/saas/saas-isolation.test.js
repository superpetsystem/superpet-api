const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

// Variáveis compartilhadas
let superAdminToken = null;
let org1Token = null;
let org2Token = null;
let org1UserId = null;
let org2UserId = null;
let org1CustomerId = null;
let org2CustomerId = null;
let org1StoreId = null;
let org2StoreId = null;

console.log('🏢 Iniciando testes de Isolamento SaaS Multi-Tenant\n');

// Helper: Criar organização diretamente no banco
async function createOrganization(id, slug, name) {
  const mysql = require('mysql2/promise');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'root',
      database: 'superpet_test',
    });

    // Usar INSERT IGNORE para não falhar se já existir
    await connection.execute(
      `INSERT IGNORE INTO organizations (id, slug, name, status, plan, limits, created_at, updated_at)
       VALUES (?, ?, ?, 'ACTIVE', 'PRO', ?, NOW(), NOW())`,
      [id, slug, name, JSON.stringify({ employees: 50, stores: 10, monthlyAppointments: 5000 })]
    );
    
    await connection.end();
    console.log(`✅ Organização criada/validada: ${name} (${slug})`);
  } catch (error) {
    console.error(`❌ Erro ao criar organização: ${error.message}`);
    throw error;
  }
}

// Setup: Login como SUPER_ADMIN e criar/atualizar 2 organizações
async function setup() {
  console.log('🔧 Setup: Login como SUPER_ADMIN...\n');
  
  // Login como SUPER_ADMIN
  const { loginAsSuperAdmin } = require('../helpers/superadmin-login.js');
  const result = await loginAsSuperAdmin();
  superAdminToken = result.accessToken;
  console.log('✅ Autenticado como SUPER_ADMIN\n');
  
  console.log('🔧 Setup: Criando 2 organizações separadas...\n');
  
  // Atualizar Organização 1 (default) para ter plano PRO e limites maiores
  const mysql = require('mysql2/promise');
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'superpet_test',
  });
  
  await connection.execute(
    `UPDATE organizations 
     SET plan = 'PRO', 
         limits = ? 
     WHERE id = '00000000-0000-0000-0000-000000000001'`,
    [JSON.stringify({ employees: 50, stores: 20, monthlyAppointments: 5000 })]
  );
  
  await connection.end();
  
  // Organização 2 (nova)
  const org2Id = '00000000-0000-0000-0000-000000000002';
  await createOrganization(org2Id, 'org2-test', 'Organization 2 Test');
  
  console.log('');
}

// Test 1: SUPER_ADMIN cria employee OWNER na Org 1
async function test1_CreateOwnerOrg1() {
  console.log('Test 1: POST /v1/employees (SUPER_ADMIN cria OWNER Org 1)');
  
  try {
    const email = `org1_owner_${Date.now()}@test.com`;
    
    const response = await axios.post(`${BASE_URL}/v1/employees`, {
      email,
      name: 'Owner Org 1',
      password: 'senha123',
      role: 'OWNER',
      jobTitle: 'OWNER',
    }, {
      headers: { 
        Authorization: `Bearer ${superAdminToken}`,
        'X-Organization-Id': '00000000-0000-0000-0000-000000000001',
      },
    });

    assert.strictEqual(response.status, 201);
    org1UserId = response.data.id;
    
    // Login como o owner criado
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password: 'senha123',
    });
    
    org1Token = loginResponse.data.access_token;

    console.log(`   ✅ Owner Org 1 criado pelo SUPER_ADMIN`);
    console.log(`   ✅ Owner fez login: ${org1Token.substring(0, 20)}...`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 2: SUPER_ADMIN cria employee OWNER na Org 2
async function test2_CreateOwnerOrg2() {
  console.log('\nTest 2: POST /v1/employees (SUPER_ADMIN cria OWNER Org 2)');
  
  try {
    const email = `org2_owner_${Date.now()}@test.com`;
    
    // SUPER_ADMIN cria owner na Org 2 (diretamente no banco por enquanto)
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
    const userId = 'org2-user-' + Date.now();
    
    // Criar user na Org 2
    await connection.execute(
      `INSERT INTO users (id, organization_id, email, name, password, status, created_at, updated_at)
       VALUES (?, '00000000-0000-0000-0000-000000000002', ?, 'Owner Org 2', ?, 'ACTIVE', NOW(), NOW())`,
      [userId, email, passwordHash]
    );
    
    // Criar employee OWNER
    await connection.execute(
      `INSERT INTO employees (id, organization_id, user_id, role, job_title, active, created_at, updated_at)
       VALUES (?, '00000000-0000-0000-0000-000000000002', ?, 'OWNER', 'OWNER', 1, NOW(), NOW())`,
      ['emp-' + userId, userId]
    );
    
    await connection.end();

    // Login como o owner criado
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password: 'senha123',
    });

    org2Token = loginResponse.data.access_token;
    org2UserId = loginResponse.data.user.id;

    console.log(`   ✅ Owner Org 2 criado pelo SUPER_ADMIN`);
    console.log(`   ✅ Owner fez login: ${org2Token.substring(0, 20)}...`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 3: Criar store na Org 1
async function test3_CreateStoreOrg1() {
  console.log('\nTest 3: POST /v1/stores (Org 1)');
  
  try {
    const response = await axios.post(`${BASE_URL}/v1/stores`, {
      code: `ORG1_STORE_${Date.now()}`,
      name: 'Loja Org 1',
      timezone: 'America/Manaus',
    }, {
      headers: { Authorization: `Bearer ${org1Token}` },
    });

    org1StoreId = response.data.id;
    console.log(`   ✅ Store Org 1 criada: ${org1StoreId}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 4: Criar store na Org 2
async function test4_CreateStoreOrg2() {
  console.log('\nTest 4: POST /v1/stores (Org 2)');
  
  try {
    const response = await axios.post(`${BASE_URL}/v1/stores`, {
      code: `ORG2_STORE_${Date.now()}`,
      name: 'Loja Org 2',
      timezone: 'America/Sao_Paulo',
    }, {
      headers: { Authorization: `Bearer ${org2Token}` },
    });

    org2StoreId = response.data.id;
    console.log(`   ✅ Store Org 2 criada: ${org2StoreId}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 5: Criar customer na Org 1
async function test5_CreateCustomerOrg1() {
  console.log('\nTest 5: POST /v1/customers (Org 1)');
  
  try {
    const response = await axios.post(`${BASE_URL}/v1/customers`, {
      name: 'Customer Org 1',
      email: `org1_customer_${Date.now()}@test.com`,
      phone: '+5592988881111',
    }, {
      headers: { Authorization: `Bearer ${org1Token}` },
    });

    org1CustomerId = response.data.id;
    console.log(`   ✅ Customer Org 1 criado: ${org1CustomerId}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 6: Criar customer na Org 2
async function test6_CreateCustomerOrg2() {
  console.log('\nTest 6: POST /v1/customers (Org 2)');
  
  try {
    const response = await axios.post(`${BASE_URL}/v1/customers`, {
      name: 'Customer Org 2',
      email: `org2_customer_${Date.now()}@test.com`,
      phone: '+5511988882222',
    }, {
      headers: { Authorization: `Bearer ${org2Token}` },
    });

    org2CustomerId = response.data.id;
    console.log(`   ✅ Customer Org 2 criado: ${org2CustomerId}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 7: Org 1 NÃO deve ver stores da Org 2
async function test7_Org1CannotSeeOrg2Stores() {
  console.log('\nTest 7: GET /v1/stores (Org 1 não deve ver Org 2)');
  
  try {
    const response = await axios.get(`${BASE_URL}/v1/stores`, {
      headers: { Authorization: `Bearer ${org1Token}` },
    });

    const storeIds = response.data.map(s => s.id);
    
    // Org 1 não deve ver a store da Org 2
    assert(!storeIds.includes(org2StoreId), 'Org 1 NÃO deve ver stores da Org 2');
    
    // Org 1 deve ver suas próprias stores
    assert(storeIds.includes(org1StoreId), 'Org 1 deve ver suas próprias stores');

    console.log(`   ✅ Isolamento OK: Org 1 vê ${response.data.length} stores (apenas suas)`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 8: Org 2 NÃO deve ver stores da Org 1
async function test8_Org2CannotSeeOrg1Stores() {
  console.log('\nTest 8: GET /v1/stores (Org 2 não deve ver Org 1)');
  
  try {
    const response = await axios.get(`${BASE_URL}/v1/stores`, {
      headers: { Authorization: `Bearer ${org2Token}` },
    });

    const storeIds = response.data.map(s => s.id);
    
    // Org 2 não deve ver a store da Org 1
    assert(!storeIds.includes(org1StoreId), 'Org 2 NÃO deve ver stores da Org 1');
    
    // Org 2 deve ver suas próprias stores
    assert(storeIds.includes(org2StoreId), 'Org 2 deve ver suas próprias stores');

    console.log(`   ✅ Isolamento OK: Org 2 vê ${response.data.length} stores (apenas suas)`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 9: Org 1 NÃO deve acessar store da Org 2 por ID
async function test9_Org1CannotAccessOrg2StoreById() {
  console.log('\nTest 9: GET /v1/stores/:id (cross-tenant - deve falhar)');
  
  try {
    await axios.get(`${BASE_URL}/v1/stores/${org2StoreId}`, {
      headers: { Authorization: `Bearer ${org1Token}` },
    });

    throw new Error('Deveria ter sido bloqueado!');
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 403) {
      console.log('   ✅ Cross-tenant access bloqueado corretamente (404/403)');
    } else if (error.message.includes('bloqueado')) {
      throw error;
    } else {
      console.error('   ❌ Erro inesperado:', error.message);
      throw error;
    }
  }
}

// Test 10: Org 1 NÃO deve ver customers da Org 2
async function test10_Org1CannotSeeOrg2Customers() {
  console.log('\nTest 10: GET /v1/customers (isolamento de customers)');
  
  try {
    const response = await axios.get(`${BASE_URL}/v1/customers`, {
      headers: { Authorization: `Bearer ${org1Token}` },
    });

    const customerIds = response.data.map(c => c.id);
    
    // Org 1 não deve ver customers da Org 2
    assert(!customerIds.includes(org2CustomerId), 'Org 1 NÃO deve ver customers da Org 2');
    
    // Org 1 deve ver seus próprios customers
    assert(customerIds.includes(org1CustomerId), 'Org 1 deve ver seus próprios customers');

    console.log(`   ✅ Isolamento OK: Org 1 vê ${response.data.length} customers (apenas seus)`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 11: Org 2 NÃO deve acessar customer da Org 1 por ID
async function test11_Org2CannotAccessOrg1CustomerById() {
  console.log('\nTest 11: GET /v1/customers/:id (cross-tenant - deve falhar)');
  
  try {
    await axios.get(`${BASE_URL}/v1/customers/${org1CustomerId}`, {
      headers: { Authorization: `Bearer ${org2Token}` },
    });

    throw new Error('Deveria ter sido bloqueado!');
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 403) {
      console.log('   ✅ Cross-tenant access bloqueado corretamente (404/403)');
    } else if (error.message.includes('bloqueado')) {
      throw error;
    } else {
      console.error('   ❌ Erro inesperado:', error.message);
      throw error;
    }
  }
}

// Test 12: Services da Org 1 não devem aparecer para Org 2
async function test12_ServicesIsolation() {
  console.log('\nTest 12: GET /v1/services (isolamento de serviços)');
  
  try {
    // Criar service na Org 1
    const service1 = await axios.post(`${BASE_URL}/v1/services`, {
      code: `ORG1_SERVICE_${Date.now()}`,
      name: 'Serviço exclusivo Org 1',
      durationMinutes: 60,
      priceBaseCents: 5000,
    }, {
      headers: { Authorization: `Bearer ${org1Token}` },
    });

    const org1ServiceId = service1.data.id;

    // Listar services da Org 2
    const org2Services = await axios.get(`${BASE_URL}/v1/services`, {
      headers: { Authorization: `Bearer ${org2Token}` },
    });

    const serviceIds = org2Services.data.map(s => s.id);
    
    // Org 2 não deve ver serviço da Org 1
    assert(!serviceIds.includes(org1ServiceId), 'Org 2 NÃO deve ver serviços da Org 1');

    console.log(`   ✅ Isolamento OK: Org 2 não vê serviços da Org 1`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 13: Validar organizationId no token JWT
async function test13_ValidateOrganizationInToken() {
  console.log('\nTest 13: GET /auth/me (validar organizationId no token)');
  
  try {
    // Verificar Org 1
    const profile1 = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${org1Token}` },
    });
    
    assert.strictEqual(
      profile1.data.organizationId, 
      '00000000-0000-0000-0000-000000000001',
      'Token Org 1 deve ter organizationId correto'
    );

    // Verificar Org 2
    const profile2 = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${org2Token}` },
    });
    
    assert.strictEqual(
      profile2.data.organizationId,
      '00000000-0000-0000-0000-000000000002',
      'Token Org 2 deve ter organizationId correto'
    );

    console.log('   ✅ OrganizationId correto em ambos os tokens');
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function runAllTests() {
  console.log('=' .repeat(70));
  console.log('🧪 TESTES DE ISOLAMENTO SAAS MULTI-TENANT');
  console.log('=' .repeat(70));

  try {
    await setup();
    await test1_CreateOwnerOrg1();
    await test2_CreateOwnerOrg2();
    await test3_CreateStoreOrg1();
    await test4_CreateStoreOrg2();
    await test5_CreateCustomerOrg1();
    await test6_CreateCustomerOrg2();
    await test7_Org1CannotSeeOrg2Stores();
    await test8_Org2CannotSeeOrg1Stores();
    await test9_Org1CannotAccessOrg2StoreById();
    await test10_Org1CannotSeeOrg2Customers();
    await test11_Org2CannotAccessOrg1CustomerById();
    await test12_ServicesIsolation();
    await test13_ValidateOrganizationInToken();

    console.log('\n' + '='.repeat(70));
    console.log('✅ TODOS OS TESTES DE ISOLAMENTO SAAS PASSARAM!');
    console.log('='.repeat(70));
    console.log('\n📊 Resumo:');
    console.log('   • 13 testes executados');
    console.log('   • 13 testes passaram');
    console.log('   • Isolamento multi-tenant: ✅ VALIDADO');
    console.log('   • Cross-tenant access: ✅ BLOQUEADO');
    console.log('   • Organization tokens: ✅ CORRETOS\n');

    return { success: true };
  } catch (error) {
    console.error('\n❌ Falha nos testes de Isolamento SaaS');
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

