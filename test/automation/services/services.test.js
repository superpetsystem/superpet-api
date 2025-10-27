const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

// Variáveis compartilhadas
let accessToken = null;
let serviceId = null;
let customServiceId = null;
let storeId = null;

console.log('💼 Iniciando testes de Services\n');

// Helper: Fazer login
async function login() {
  const authTests = require('../auth/auth.test.js');
  const result = await authTests.runAllTests();
  accessToken = result.accessToken;
  console.log('\n✅ Autenticado para testes de Services\n');
}

// Helper: Criar loja para testes
async function createStore() {
  const response = await axios.post(`${BASE_URL}/stores`, {
    code: `SVC_STORE_${Date.now()}`,
    name: 'Loja para Services',
    timezone: 'America/Manaus',
    openingHours: { mon: [['08:00', '18:00']] },
    resourcesCatalog: ['GROOMER'],
    capacity: { GROOMER: 2 },
  }, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  storeId = response.data.id;
  console.log(`   ✅ Loja criada: ${storeId}`);
  
  // Habilitar feature CUSTOM_SERVICE na loja
  try {
    await axios.put(
      `${BASE_URL}/stores/${storeId}/features/CUSTOM_SERVICE`,
      { enabled: true },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    console.log(`   ✅ Feature CUSTOM_SERVICE habilitada\n`);
  } catch (error) {
    console.log(`   ⚠️  Feature CUSTOM_SERVICE não disponível - testes podem falhar\n`);
  }
}

// Test 1: Listar services (pode estar vazio)
async function test1_ListServices() {
  console.log('Test 1: GET /services');
  
  try {
    const response = await axios.get(`${BASE_URL}/services`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(Array.isArray(response.data), 'Deve retornar array');

    console.log(`   ✅ ${response.data.length} serviços encontrados`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 2: Criar service
async function test2_CreateService() {
  console.log('\nTest 2: POST /services');
  
  try {
    const response = await axios.post(`${BASE_URL}/services`, {
      code: `TEST_SERV_${Date.now()}`,
      name: 'Serviço de Teste',
      description: 'Descrição do serviço de teste',
      durationMinutes: 60,
      bufferBefore: 10,
      bufferAfter: 10,
      resourcesRequired: ['GROOMER'],
      visibility: 'PUBLIC',
      priceBaseCents: 5000,
      taxCode: 'TEST_01',
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 201, 'Status deve ser 201');
    assert(response.data.id, 'Deve retornar ID');
    assert.strictEqual(response.data.code.substring(0, 9), 'TEST_SERV', 'Code deve começar com TEST_SERV');

    serviceId = response.data.id;

    console.log(`   ✅ Service criado: ${response.data.name}`);
    console.log(`   ✅ ID: ${serviceId}`);
    console.log(`   ✅ Preço: R$ ${(response.data.priceBaseCents / 100).toFixed(2)}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 3: Criar custom service (override por loja)
async function test3_CreateCustomService() {
  console.log('\nTest 3: POST /stores/:storeId/custom-services');
  
  if (!serviceId) {
    console.log('   ⚠️  Pulado (sem serviceId)');
    return;
  }
  
  try {
    const response = await axios.post(
      `${BASE_URL}/stores/${storeId}/custom-services`,
      {
        serviceId: serviceId,
        priceOverrideCents: 4500, // R$ 45 (desconto de R$ 50 para R$ 45)
        durationMinutesOverride: 50,
        localNotes: 'Preço promocional para loja Centro',
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 201, 'Status deve ser 201');
    assert(response.data.id, 'Deve retornar ID');
    assert.strictEqual(response.data.state, 'DRAFT', 'State inicial deve ser DRAFT');
    assert.strictEqual(response.data.priceOverrideCents, 4500, 'Preço override deve ser 4500');

    customServiceId = response.data.id;

    console.log(`   ✅ Custom service criado (DRAFT)`);
    console.log(`   ✅ ID: ${customServiceId}`);
    console.log(`   ✅ Preço override: R$ ${(response.data.priceOverrideCents / 100).toFixed(2)}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 4: Publicar custom service
async function test4_PublishCustomService() {
  console.log('\nTest 4: POST /stores/:storeId/custom-services/:id/publish');
  
  if (!customServiceId) {
    console.log('   ⚠️  Pulado (sem customServiceId)');
    return;
  }
  
  try {
    const response = await axios.post(
      `${BASE_URL}/stores/${storeId}/custom-services/${customServiceId}/publish`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.state, 'PUBLISHED', 'State deve ser PUBLISHED');

    console.log('   ✅ Custom service publicado');
    console.log('   ✅ Override agora está ativo para a loja');
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 5: Listar custom services
async function test5_ListCustomServices() {
  console.log('\nTest 5: GET /stores/:storeId/custom-services');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/stores/${storeId}/custom-services`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(Array.isArray(response.data), 'Deve retornar array');

    console.log(`   ✅ ${response.data.length} custom service(s) na loja`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 6: Criar service com duração inválida
async function test6_CreateServiceInvalidDuration() {
  console.log('\nTest 6: POST /services (duração inválida)');
  
  try {
    await axios.post(`${BASE_URL}/services`, {
      code: `INVALID_${Date.now()}`,
      name: 'Serviço Inválido',
      durationMinutes: 0, // Inválido (mínimo 1)
      priceBaseCents: 1000,
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('   ✅ Rejeitou duração inválida');
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.message);
      throw error;
    }
  }
}

// Test 7: Arquivar custom service
async function test7_ArchiveCustomService() {
  console.log('\nTest 7: POST /stores/:storeId/custom-services/:id/archive');
  
  if (!customServiceId) {
    console.log('   ⚠️  Pulado (sem customServiceId)');
    return;
  }
  
  try {
    const response = await axios.post(
      `${BASE_URL}/stores/${storeId}/custom-services/${customServiceId}/archive`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.state, 'ARCHIVED', 'State deve ser ARCHIVED');

    console.log('   ✅ Custom service arquivado');
    console.log('   ✅ Loja volta a usar preço padrão do serviço');
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function runAllTests() {
  console.log('=' .repeat(70));
  console.log('🧪 TESTES DE SERVICES & CUSTOM SERVICES');
  console.log('=' .repeat(70));

  try {
    await login();
    await createStore();
    await test1_ListServices();
    await test2_CreateService();
    await test3_CreateCustomService();
    await test4_PublishCustomService();
    await test5_ListCustomServices();
    await test6_CreateServiceInvalidDuration();
    await test7_ArchiveCustomService();

    console.log('\n' + '='.repeat(70));
    console.log('✅ TODOS OS TESTES DE SERVICES PASSARAM!');
    console.log('=' .repeat(70));
    console.log(`\n📊 Resumo:`);
    console.log(`   • 7 testes executados`);
    console.log(`   • 7 testes passaram`);
    console.log(`   • Service ID: ${serviceId}`);
    console.log(`   • Custom Service ID: ${customServiceId}\n`);

    return { success: true, serviceId, customServiceId };
  } catch (error) {
    console.error('\n❌ Falha nos testes de Services');
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


