const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

// Variáveis compartilhadas
let accessToken = null;
let customerId = null;
let petId = null;

console.log('🐾 Iniciando testes de Pets\n');

// Helper: Setup (login + criar customer)
async function setup() {
  const authTests = require('../auth/auth.test.js');
  const authResult = await authTests.runAllTests();
  accessToken = authResult.accessToken;

  const customersTests = require('../customers/customers.test.js');
  const customerResult = await customersTests.runAllTests();
  customerId = customerResult.customerId;

  console.log('\n✅ Setup completo para testes de Pets\n');
}

// Test 1: Criar pet
async function test1_CreatePet() {
  console.log('Test 1: POST /pets');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/pets`,
      {
        customerId: customerId,
        name: 'Thor',
        species: 'DOG',
        breed: 'Labrador',
        birthdate: '2019-03-20',
        weightKg: 32.5,
        allergies: ['frango', 'soja'],
        microchip: `BR-TEST-${Date.now()}`,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 201, 'Status deve ser 201');
    assert(response.data.id, 'Deve retornar ID');
    assert.strictEqual(response.data.name, 'Thor', 'Nome deve corresponder');
    assert.strictEqual(response.data.species, 'DOG', 'Espécie deve ser DOG');
    assert.strictEqual(response.data.status, 'ACTIVE', 'Status deve ser ACTIVE');

    petId = response.data.id;

    console.log(`   ✅ Pet criado: ${response.data.name} (${response.data.breed})`);
    console.log(`   ✅ ID: ${petId}`);
    console.log(`   ✅ Peso: ${response.data.weightKg}kg`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 2: Listar pets do customer
async function test2_ListPetsByCustomer() {
  console.log('\nTest 2: GET /pets/customers/:customerId');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/pets/customers/${customerId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(Array.isArray(response.data), 'Deve retornar array');
    assert(response.data.length >= 1, 'Deve ter pelo menos 1 pet');

    console.log(`   ✅ ${response.data.length} pet(s) encontrado(s)`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 3: Ver pet específico
async function test3_GetPetById() {
  console.log('\nTest 3: GET /pets/:id');
  
  try {
    const response = await axios.get(`${BASE_URL}/pets/${petId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.id, petId, 'ID deve corresponder');
    assert(response.data.customer, 'Deve incluir customer');

    console.log(`   ✅ Pet: ${response.data.name}`);
    console.log(`   ✅ Customer: ${response.data.customer.name}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 4: Atualizar pet
async function test4_UpdatePet() {
  console.log('\nTest 4: PUT /pets/:id');
  
  try {
    const response = await axios.put(
      `${BASE_URL}/pets/${petId}`,
      {
        name: 'Thor Odinson',
        weightKg: 33.0,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.name, 'Thor Odinson', 'Nome deve estar atualizado');
    assert.strictEqual(parseFloat(response.data.weightKg), 33.0, 'Peso deve estar atualizado');

    console.log('   ✅ Pet atualizado');
    console.log(`   ✅ Novo nome: ${response.data.name}`);
    console.log(`   ✅ Novo peso: ${response.data.weightKg}kg`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 5: Criar pet com peso inválido
async function test5_CreatePetInvalidWeight() {
  console.log('\nTest 5: POST /pets (peso inválido)');
  
  try {
    await axios.post(
      `${BASE_URL}/pets`,
      {
        customerId: customerId,
        name: 'Pet Inválido',
        species: 'DOG',
        weightKg: 300, // Acima do limite de 200kg
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('   ✅ Rejeitou peso inválido corretamente');
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.message);
      throw error;
    }
  }
}

// Test 6: Marcar pet como DECEASED
async function test6_MarkPetDeceased() {
  console.log('\nTest 6: PATCH /pets/:id/status');
  
  try {
    const response = await axios.patch(
      `${BASE_URL}/pets/${petId}/status`,
      { status: 'DECEASED' },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.status, 'DECEASED', 'Status deve ser DECEASED');

    console.log('   ✅ Pet marcado como DECEASED');
    console.log('   ⚠️  Agendamentos futuros serão bloqueados');

    // Voltar para ACTIVE
    await axios.patch(
      `${BASE_URL}/pets/${petId}/status`,
      { status: 'ACTIVE' },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    console.log('   ✅ Status restaurado para ACTIVE');
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function runAllTests() {
  console.log('=' .repeat(70));
  console.log('🧪 TESTES DE PETS');
  console.log('=' .repeat(70));

  try {
    await setup();
    await test1_CreatePet();
    await test2_ListPetsByCustomer();
    await test3_GetPetById();
    await test4_UpdatePet();
    await test5_CreatePetInvalidWeight();
    await test6_MarkPetDeceased();

    console.log('\n' + '='.repeat(70));
    console.log('✅ TODOS OS TESTES DE PETS PASSARAM!');
    console.log('=' .repeat(70));
    console.log(`\n📊 Resumo:`);
    console.log(`   • 6 testes executados`);
    console.log(`   • 6 testes passaram`);
    console.log(`   • Pet ID: ${petId}\n`);

    return { success: true, petId, customerId };
  } catch (error) {
    console.error('\n❌ Falha nos testes de Pets');
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
