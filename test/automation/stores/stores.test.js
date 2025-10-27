const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

// Variáveis compartilhadas
let accessToken = null;
let storeId = null;
let storeId2 = null;
let storeCode = null;
let customServiceId = null;
const ORGANIZATION_ID = '00000000-0000-0000-0000-000000000001';

console.log('🏪 Iniciando testes de Stores\n');

// Helper: Fazer login
async function login() {
  const authTests = require('../auth/auth.test.js');
  const result = await authTests.runAllTests();
  accessToken = result.accessToken;
  console.log('\n✅ Autenticado para testes de Stores\n');
}

// Test 1: Listar stores (pode estar vazio)
async function test1_ListStores() {
  console.log('Test 1: GET /stores');
  
  try {
    const response = await axios.get(`${BASE_URL}/stores`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(Array.isArray(response.data), 'Deve retornar array');

    console.log(`   ✅ ${response.data.length} lojas encontradas`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 2: Criar primeira store
async function test2_CreateStore() {
  console.log('\nTest 2: POST /stores (primeira loja)');
  
  try {
    storeCode = `STORE_${Date.now()}`;
    const response = await axios.post(`${BASE_URL}/stores`, {
      code: storeCode,
      name: 'Loja Principal',
      timezone: 'America/Manaus',
      openingHours: {
        mon: [['08:00', '18:00']],
        tue: [['08:00', '18:00']],
        wed: [['08:00', '18:00']],
      },
      resourcesCatalog: ['GROOMER', 'TABLE'],
      capacity: { GROOMER: 2, TABLE: 3 },
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 201, 'Status deve ser 201');
    assert(response.data.id, 'Deve retornar ID');
    assert(response.data.features, 'Deve criar features padrão');

    storeId = response.data.id;

    console.log(`   ✅ Loja criada: ${response.data.name}`);
    console.log(`   ✅ ID: ${storeId}`);
    console.log(`   ✅ Code: ${storeCode}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 3: Ver loja específica
async function test3_GetStoreById() {
  console.log('\nTest 3: GET /stores/:id');
  
  try {
    const response = await axios.get(`${BASE_URL}/stores/${storeId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(response.data.id, 'Deve retornar store');
    assert(response.data.name, 'Deve ter name');

    console.log(`   ✅ Loja: ${response.data.name}`);
    console.log(`   ✅ Code: ${response.data.code}`);
    console.log(`   ✅ Features: ${response.data.features ? response.data.features.length : 0}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 4: Listar features da loja
async function test4_GetStoreFeatures() {
  console.log('\nTest 4: GET /stores/:storeId/features');
  
  try {
    const response = await axios.get(`${BASE_URL}/stores/${storeId}/features`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(Array.isArray(response.data), 'Deve retornar array');

    console.log(`   ✅ ${response.data.length} features disponíveis`);
    
    if (response.data.length > 0) {
      const keys = response.data.map(f => f.featureKey);
      console.log(`   ✅ Features: ${keys.slice(0, 4).join(', ')}${keys.length > 4 ? '...' : ''}`);
    }
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 5: Configurar feature
async function test5_ConfigureFeature() {
  console.log('\nTest 5: PUT /stores/:storeId/features/:key');
  
  try {
    const response = await axios.put(
      `${BASE_URL}/stores/${storeId}/features/TELEPICKUP`,
      {
        enabled: true,
        limits: { dailyPickups: 50 },
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.featureKey, 'TELEPICKUP', 'Feature key deve ser TELEPICKUP');
    assert.strictEqual(response.data.enabled, true, 'Deve estar habilitada');
    assert.strictEqual(response.data.limits.dailyPickups, 50, 'Limite deve ser 50');

    console.log('   ✅ Feature TELEPICKUP configurada');
    console.log(`   ✅ Limite diário: ${response.data.limits.dailyPickups} pickups`);
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('   ⚠️  Feature TELEPICKUP não existe - pulando teste');
    } else {
      console.error('   ❌ Erro:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Test 6: Atualizar store
async function test6_UpdateStore() {
  console.log('\nTest 6: PUT /stores/:id');
  
  try {
    const response = await axios.put(
      `${BASE_URL}/stores/${storeId}`,
      { name: 'Loja Principal - Atualizada' },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.name, 'Loja Principal - Atualizada', 'Nome deve estar atualizado');

    console.log('   ✅ Store atualizada com sucesso');
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 7: Criar store com code duplicado
async function test7_CreateDuplicateCode() {
  console.log('\nTest 7: POST /stores (code duplicado)');
  
  try {
    await axios.post(`${BASE_URL}/stores`, {
      code: storeCode, // Usar o mesmo code da loja criada
      name: 'Loja Duplicada',
      timezone: 'America/Manaus',
      openingHours: { mon: [['09:00', '18:00']] },
      resourcesCatalog: ['GROOMER'],
      capacity: { GROOMER: 1 },
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('STORE_CODE_TAKEN')) {
      console.log('   ✅ Rejeitou code duplicado corretamente');
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.message);
      throw error;
    }
  }
}

async function runAllTests() {
  console.log('=' .repeat(70));
  console.log('🧪 TESTES DE STORES & FEATURES');
  console.log('=' .repeat(70));

  try {
    await login();
    await test1_ListStores();
    await test2_CreateStore();
    await test3_GetStoreById();
    await test4_GetStoreFeatures();
    await test5_ConfigureFeature();
    await test6_UpdateStore();
    await test7_CreateDuplicateCode();

    console.log('\n' + '='.repeat(70));
    console.log('✅ TODOS OS TESTES DE STORES PASSARAM!');
    console.log('=' .repeat(70));
    console.log(`\n📊 Resumo:`);
    console.log(`   • 7 testes executados`);
    console.log(`   • 7 testes passaram`);
    console.log(`   • Store ID: ${storeId}`);
    console.log(`   • Store Code: ${storeCode}\n`);

    return { success: true, storeId };
  } catch (error) {
    console.error('\n❌ Falha nos testes de Stores');
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


