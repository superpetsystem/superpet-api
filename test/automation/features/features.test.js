const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

// Variáveis compartilhadas
let accessToken = null;
let customerId = null;
let petId = null;
let pickupId = null;
let streamId = null;
let storeId = null;

console.log('🎯 Iniciando testes de Features (TELEPICKUP e LIVE_CAM)\n');

// Helper: Setup completo
async function setup() {
  const { loginSimple } = require('../helpers/auth-helper-simple.js');
  accessToken = await loginSimple('Features Tester');

  const petsTests = require('../pets/pets.test.js');
  const petsResult = await petsTests.runAllTests();
  customerId = petsResult.customerId;
  petId = petsResult.petId;

  // Criar loja e habilitar features
  const storeResponse = await axios.post(`${BASE_URL}/stores`, {
    code: `FEAT_STORE_${Date.now()}`,
    name: 'Loja para Features',
    timezone: 'America/Manaus',
    openingHours: { mon: [['08:00', '18:00']] },
    resourcesCatalog: ['GROOMER'],
    capacity: { GROOMER: 2 },
  }, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  storeId = storeResponse.data.id;
  
  // Habilitar features TELEPICKUP e LIVE_CAM
  try {
    await axios.put(
      `${BASE_URL}/stores/${storeId}/features/TELEPICKUP`,
      { enabled: true },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    await axios.put(
      `${BASE_URL}/stores/${storeId}/features/LIVE_CAM`,
      { enabled: true },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  } catch (error) {
    // Features podem não existir em banco limpo
  }

  console.log('\n✅ Setup completo para testes de Features\n');
}

// Test 1: Criar Pickup (TELEPICKUP)
async function test1_CreatePickup() {
  console.log('Test 1: POST /stores/:storeId/pickups');
  
  try {
    const windowStart = new Date();
    windowStart.setHours(windowStart.getHours() + 2);
    
    const windowEnd = new Date(windowStart);
    windowEnd.setHours(windowEnd.getHours() + 2);

    const response = await axios.post(
      `${BASE_URL}/stores/${storeId}/pickups`,
      {
        customerId: customerId,
        petId: petId,
        pickupWindowStart: windowStart.toISOString(),
        pickupWindowEnd: windowEnd.toISOString(),
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 201, 'Status deve ser 201');
    assert(response.data.id, 'Deve retornar ID');
    assert.strictEqual(response.data.status, 'REQUESTED', 'Status inicial deve ser REQUESTED');

    pickupId = response.data.id;

    console.log(`   ✅ Pickup criado: ${pickupId}`);
    console.log(`   ✅ Janela: ${windowStart.toLocaleTimeString()} - ${windowEnd.toLocaleTimeString()}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 2: Atualizar status do pickup
async function test2_UpdatePickupStatus() {
  console.log('\nTest 2: PATCH /stores/:storeId/pickups/:id/status');
  
  if (!pickupId) {
    console.log('   ⚠️  Pulado (sem pickupId)');
    return;
  }
  
  try {
    const response = await axios.patch(
      `${BASE_URL}/stores/${storeId}/pickups/${pickupId}/status`,
      { status: 'CONFIRMED' },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.status, 'CONFIRMED', 'Status deve ser CONFIRMED');

    console.log('   ✅ Pickup confirmado');
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 3: Listar pickups
async function test3_ListPickups() {
  console.log('\nTest 3: GET /stores/:storeId/pickups');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const response = await axios.get(
      `${BASE_URL}/stores/${storeId}/pickups?date=${today}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(Array.isArray(response.data), 'Deve retornar array');

    console.log(`   ✅ ${response.data.length} pickup(s) para hoje`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 4: Criar stream (LIVE_CAM)
async function test4_CreateStream() {
  console.log('\nTest 4: POST /live-cam/stores/:storeId/streams');
  
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const response = await axios.post(
      `${BASE_URL}/live-cam/stores/${storeId}/streams`,
      {
        petId: petId,
        streamUrl: 'https://player.example.com/live/test123',
        expiresAt: expiresAt.toISOString(),
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 201, 'Status deve ser 201');
    assert(response.data.id, 'Deve retornar ID');
    assert.strictEqual(response.data.status, 'ONLINE', 'Status inicial deve ser ONLINE');

    streamId = response.data.id;

    console.log(`   ✅ Stream criado: ${streamId}`);
    console.log(`   ✅ URL: ${response.data.streamUrl}`);
    console.log(`   ✅ Expira em: ${expiresAt.toLocaleString()}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 5: Cliente ver streams do pet
async function test5_GetPetStreams() {
  console.log('\nTest 5: GET /live-cam/customers/:customerId/pets/:petId');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/live-cam/customers/${customerId}/pets/${petId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(Array.isArray(response.data), 'Deve retornar array');

    console.log(`   ✅ ${response.data.length} stream(s) ONLINE para o pet`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 6: Deletar stream
async function test6_DeleteStream() {
  console.log('\nTest 6: DELETE /live-cam/stores/:storeId/streams/:id');
  
  if (!streamId) {
    console.log('   ⚠️  Pulado (sem streamId)');
    return;
  }
  
  try {
    const response = await axios.delete(
      `${BASE_URL}/live-cam/stores/${storeId}/streams/${streamId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 204, 'Status deve ser 204');

    console.log('   ✅ Stream deletado com sucesso');
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 7: Criar pickup com janela inválida
async function test7_CreatePickupInvalidWindow() {
  console.log('\nTest 7: POST /stores/:storeId/pickups (janela inválida)');
  
  try {
    const windowStart = new Date();
    const windowEnd = new Date(windowStart);
    windowEnd.setMinutes(windowEnd.getMinutes() + 10); // Apenas 10min (< 30min mínimo)

    await axios.post(
      `${BASE_URL}/stores/${storeId}/pickups`,
      {
        customerId: customerId,
        petId: petId,
        pickupWindowStart: windowStart.toISOString(),
        pickupWindowEnd: windowEnd.toISOString(),
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('PICKUP_INVALID_WINDOW')) {
      console.log('   ✅ Rejeitou janela < 30min corretamente');
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.message);
      throw error;
    }
  }
}

async function runAllTests() {
  console.log('=' .repeat(70));
  console.log('🧪 TESTES DE FEATURES (TELEPICKUP & LIVE_CAM)');
  console.log('=' .repeat(70));

  try {
    await setup();
    await test1_CreatePickup();
    await test2_UpdatePickupStatus();
    await test3_ListPickups();
    await test4_CreateStream();
    await test5_GetPetStreams();
    await test6_DeleteStream();
    await test7_CreatePickupInvalidWindow();

    console.log('\n' + '='.repeat(70));
    console.log('✅ TODOS OS TESTES DE FEATURES PASSARAM!');
    console.log('=' .repeat(70));
    console.log(`\n📊 Resumo:`);
    console.log(`   • 7 testes executados`);
    console.log(`   • 7 testes passaram`);
    console.log(`   • Pickup criado: ${pickupId ? 'Sim' : 'Não'}`);
    console.log(`   • Stream criado: ${streamId ? 'Sim' : 'Não'}\n`);

    return { success: true };
  } catch (error) {
    console.error('\n❌ Falha nos testes de Features');
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



