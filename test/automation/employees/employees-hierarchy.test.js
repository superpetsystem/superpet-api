const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

// Variáveis compartilhadas
let superAdminToken = null;
let ownerToken = null;
let adminToken = null;
let staffToken = null;
let viewerToken = null;

let ownerId = null;
let adminId = null;
let staffId = null;
let viewerId = null;

const ORG_ID = '00000000-0000-0000-0000-000000000001';

console.log('👥 Iniciando testes de Hierarquia de Employees\n');

// Setup: Login SUPER_ADMIN
async function setup() {
  const { loginAsSuperAdmin } = require('../helpers/superadmin-login.js');
  const result = await loginAsSuperAdmin();
  superAdminToken = result.accessToken;
  console.log('✅ Autenticado como SUPER_ADMIN\n');
}

// Test 1: SUPER_ADMIN cria OWNER
async function test1_SuperAdminCreatesOwner() {
  console.log('Test 1: POST /employees (SUPER_ADMIN → OWNER)');
  
  try {
    const email = `owner_${Date.now()}@test.com`;
    const response = await axios.post(`${BASE_URL}/employees`, {
      email,
      name: 'Test Owner',
      password: 'senha123',
      role: 'OWNER',
      jobTitle: 'OWNER',
    }, {
      headers: { 
        Authorization: `Bearer ${superAdminToken}`,
        'X-Organization-Id': ORG_ID,
      },
    });

    assert.strictEqual(response.status, 201);
    ownerId = response.data.id;

    // Login como OWNER
    const login = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password: 'senha123',
    });
    ownerToken = login.data.access_token;

    console.log(`   ✅ OWNER criado: ${response.data.id}`);
    console.log(`   ✅ Role: OWNER | JobTitle: OWNER`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 2: OWNER cria ADMIN
async function test2_OwnerCreatesAdmin() {
  console.log('\nTest 2: POST /employees (OWNER → ADMIN)');
  
  try {
    const email = `admin_${Date.now()}@test.com`;
    const response = await axios.post(`${BASE_URL}/employees`, {
      email,
      name: 'Test Admin',
      password: 'senha123',
      role: 'ADMIN',
      jobTitle: 'MANAGER',
    }, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });

    assert.strictEqual(response.status, 201);
    adminId = response.data.id;

    // Login como ADMIN
    const login = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password: 'senha123',
    });
    adminToken = login.data.access_token;

    console.log(`   ✅ ADMIN criado: ${response.data.id}`);
    console.log(`   ✅ Role: ADMIN | JobTitle: MANAGER`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 3: ADMIN cria STAFF
async function test3_AdminCreatesStaff() {
  console.log('\nTest 3: POST /employees (ADMIN → STAFF)');
  
  try {
    const email = `staff_${Date.now()}@test.com`;
    const response = await axios.post(`${BASE_URL}/employees`, {
      email,
      name: 'Test Staff',
      password: 'senha123',
      role: 'STAFF',
      jobTitle: 'GROOMER',
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(response.status, 201);
    staffId = response.data.id;

    // Login como STAFF
    const login = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password: 'senha123',
    });
    staffToken = login.data.access_token;

    console.log(`   ✅ STAFF criado: ${response.data.id}`);
    console.log(`   ✅ Role: STAFF | JobTitle: GROOMER`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 4: ADMIN cria VIEWER
async function test4_AdminCreatesViewer() {
  console.log('\nTest 4: POST /employees (ADMIN → VIEWER)');
  
  try {
    const email = `viewer_${Date.now()}@test.com`;
    const response = await axios.post(`${BASE_URL}/employees`, {
      email,
      name: 'Test Viewer',
      password: 'senha123',
      role: 'VIEWER',
      jobTitle: 'OTHER',
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(response.status, 201);
    viewerId = response.data.id;

    console.log(`   ✅ VIEWER criado: ${response.data.id}`);
    console.log(`   ✅ Role: VIEWER | JobTitle: OTHER`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 5: STAFF NÃO pode criar employees
async function test5_StaffCannotCreateEmployees() {
  console.log('\nTest 5: POST /employees (STAFF não pode criar)');
  
  try {
    await axios.post(`${BASE_URL}/employees`, {
      email: `test_${Date.now()}@test.com`,
      name: 'Test',
      password: 'senha123',
      role: 'STAFF',
    }, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });

    throw new Error('Deveria ter sido bloqueado!');
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('   ✅ STAFF bloqueado corretamente (403)');
    } else if (error.message.includes('bloqueado')) {
      throw error;
    } else {
      console.error('   ❌ Erro inesperado:', error.message);
      throw error;
    }
  }
}

// Test 6: ADMIN NÃO pode criar OWNER
async function test6_AdminCannotCreateOwner() {
  console.log('\nTest 6: POST /employees (ADMIN não pode criar OWNER)');
  
  try {
    await axios.post(`${BASE_URL}/employees`, {
      email: `owner2_${Date.now()}@test.com`,
      name: 'Test Owner 2',
      password: 'senha123',
      role: 'OWNER',
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    throw new Error('Deveria ter sido bloqueado!');
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('   ✅ ADMIN bloqueado de criar OWNER (403)');
    } else if (error.message.includes('bloqueado')) {
      throw error;
    } else {
      console.error('   ❌ Erro inesperado:', error.message);
      throw error;
    }
  }
}

// Test 7: Listar employees com filtros de role
async function test7_ListEmployeesByRole() {
  console.log('\nTest 7: GET /employees?role=STAFF');
  
  try {
    const response = await axios.get(`${BASE_URL}/employees?role=STAFF`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });

    assert.strictEqual(response.status, 200);
    assert(Array.isArray(response.data));
    
    // Deve conter apenas STAFF
    const allStaff = response.data.every(e => e.role === 'STAFF');
    assert(allStaff, 'Deve retornar apenas STAFF');

    console.log(`   ✅ ${response.data.length} STAFF encontrados`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 8: Listar employees com filtro de jobTitle
async function test8_ListEmployeesByJobTitle() {
  console.log('\nTest 8: GET /employees?jobTitle=GROOMER');
  
  try {
    const response = await axios.get(`${BASE_URL}/employees?jobTitle=GROOMER`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });

    assert.strictEqual(response.status, 200);
    assert(Array.isArray(response.data));
    
    // Deve conter apenas GROOMER
    const allGroomers = response.data.every(e => e.jobTitle === 'GROOMER');
    assert(allGroomers, 'Deve retornar apenas GROOMER');

    console.log(`   ✅ ${response.data.length} GROOMER(s) encontrados`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 9: OWNER cria múltiplos employees com diferentes jobTitles
async function test9_CreateMultipleJobTitles() {
  console.log('\nTest 9: Criar employees com diferentes jobTitles');
  
  try {
    const jobTitles = [
      { role: 'STAFF', jobTitle: 'VETERINARIAN', name: 'Dr. Vet' },
      { role: 'STAFF', jobTitle: 'RECEPTIONIST', name: 'Recepcionista' },
      { role: 'STAFF', jobTitle: 'BATHER', name: 'Banhista' },
    ];

    for (const job of jobTitles) {
      await axios.post(`${BASE_URL}/employees`, {
        email: `${job.jobTitle.toLowerCase()}_${Date.now()}@test.com`,
        name: job.name,
        password: 'senha123',
        role: job.role,
        jobTitle: job.jobTitle,
      }, {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });
    }

    console.log(`   ✅ 3 employees criados com jobTitles diferentes`);
    console.log(`   ✅ VETERINARIAN, RECEPTIONIST, BATHER`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 10: Validar total de employees
async function test10_ListAllEmployees() {
  console.log('\nTest 10: GET /employees (listar todos)');
  
  try {
    const response = await axios.get(`${BASE_URL}/employees`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });

    assert.strictEqual(response.status, 200);
    assert(response.data.length >= 7, 'Deve ter pelo menos 7 employees');

    const roles = response.data.map(e => e.role);
    const jobTitles = response.data.map(e => e.jobTitle).filter(Boolean);

    console.log(`   ✅ Total: ${response.data.length} employees`);
    console.log(`   ✅ Roles: ${[...new Set(roles)].join(', ')}`);
    console.log(`   ✅ JobTitles únicos: ${[...new Set(jobTitles)].length}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function runAllTests() {
  console.log('=' .repeat(70));
  console.log('🧪 TESTES DE HIERARQUIA DE EMPLOYEES');
  console.log('=' .repeat(70));

  try {
    await setup();
    await test1_SuperAdminCreatesOwner();
    await test2_OwnerCreatesAdmin();
    await test3_AdminCreatesStaff();
    await test4_AdminCreatesViewer();
    await test5_StaffCannotCreateEmployees();
    await test6_AdminCannotCreateOwner();
    await test7_ListEmployeesByRole();
    await test8_ListEmployeesByJobTitle();
    await test9_CreateMultipleJobTitles();
    await test10_ListAllEmployees();

    console.log('\n' + '='.repeat(70));
    console.log('✅ TODOS OS TESTES DE HIERARQUIA PASSARAM!');
    console.log('='.repeat(70));
    console.log('\n📊 Resumo:');
    console.log('   • 10 testes executados');
    console.log('   • Hierarquia de roles: ✅ VALIDADA');
    console.log('   • JobTitles: ✅ VALIDADOS');
    console.log('   • Permissões: ✅ VALIDADAS\n');

    return { success: true };
  } catch (error) {
    console.error('\n❌ Falha nos testes de Hierarquia');
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

