const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

// Variáveis compartilhadas
let accessToken = null;
let recordId = null;
let vaccinationId = null;
let petId = null;
let storeId = null;
let veterinarianId = null;

console.log('🏥 Iniciando testes de Veterinary Records\n');

// Helper: Setup completo
async function setup() {
  const authTests = require('../auth/auth.test.js');
  const result = await authTests.runAllTests();
  accessToken = result.accessToken;

  const petsTests = require('../pets/pets.test.js');
  const petResult = await petsTests.runAllTests();
  petId = petResult.petId;

  // Pegar store e veterinarian IDs do banco
  const storesResponse = await axios.get(`${BASE_URL}/stores`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  storeId = storesResponse.data[0].id;

  // Pegar employees (filtra por OWNER/ADMIN que podem criar registros)
  const employeesResponse = await axios.get(`${BASE_URL}/employees?role=OWNER`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (employeesResponse.data.length > 0) {
    veterinarianId = employeesResponse.data[0].id;
  } else {
    // Fallback: pegar qualquer employee
    const allEmployees = await axios.get(`${BASE_URL}/employees`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    veterinarianId = allEmployees.data[0].id;
  }

  // Habilitar feature VETERINARY_RECORDS na loja
  await axios.put(`${BASE_URL}/stores/${storeId}/features/VETERINARY_RECORDS`, {
    enabled: true,
  }, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  console.log('\n✅ Setup completo para testes de Veterinary');
  console.log(`   • Store ID: ${storeId}`);
  console.log(`   • Veterinarian ID: ${veterinarianId}`);
  console.log(`   • Feature VETERINARY_RECORDS habilitada\n`);
}

// Test 1: Criar prontuário veterinário
async function test1_CreateRecord() {
  console.log('Test 1: POST /veterinary/records');

  try {
    const response = await axios.post(
      `${BASE_URL}/veterinary/records`,
      {
        petId: petId,
        storeId: storeId,
        veterinarianId: veterinarianId,
        type: 'CONSULTATION',
        visitDate: new Date().toISOString(),
        reason: 'Consulta de rotina',
        symptoms: 'Pet saudável',
        diagnosis: 'Saúde normal',
        treatment: 'Manter dieta e exercícios',
        weightKg: 32.5,
        temperatureCelsius: 38.5,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 201, 'Status deve ser 201');
    assert(response.data.id, 'Deve retornar ID');
    assert.strictEqual(response.data.type, 'CONSULTATION', 'Tipo deve ser CONSULTATION');

    recordId = response.data.id;

    console.log(`   ✅ Prontuário criado: ${recordId}`);
    console.log(`   ✅ Tipo: ${response.data.type}`);
    console.log(`   ✅ Peso: ${response.data.weightKg}kg`);
    console.log(`   ✅ Temperatura: ${response.data.temperatureCelsius}°C`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 2: Ver prontuário por ID
async function test2_GetRecord() {
  console.log('\nTest 2: GET /veterinary/records/:id');

  try {
    const response = await axios.get(`${BASE_URL}/veterinary/records/${recordId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.id, recordId, 'ID deve corresponder');
    assert.strictEqual(response.data.reason, 'Consulta de rotina', 'Razão deve corresponder');

    console.log('   ✅ Prontuário encontrado');
    console.log(`   ✅ Diagnóstico: ${response.data.diagnosis}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 3: Listar prontuários do pet
async function test3_ListPetRecords() {
  console.log('\nTest 3: GET /veterinary/pets/:petId/records');

  try {
    const response = await axios.get(`${BASE_URL}/veterinary/pets/${petId}/records`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(Array.isArray(response.data), 'Deve retornar array');
    assert(response.data.length >= 1, 'Deve ter pelo menos 1 prontuário');

    console.log(`   ✅ ${response.data.length} prontuário(s) encontrado(s)`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 4: Atualizar prontuário
async function test4_UpdateRecord() {
  console.log('\nTest 4: PUT /veterinary/records/:id');

  try {
    const response = await axios.put(
      `${BASE_URL}/veterinary/records/${recordId}`,
      {
        diagnosis: 'Saúde excelente - atualizado',
        notes: 'Pet muito bem cuidado',
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.diagnosis, 'Saúde excelente - atualizado', 'Diagnóstico atualizado');

    console.log('   ✅ Prontuário atualizado');
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 5: Criar vacinação
async function test5_CreateVaccination() {
  console.log('\nTest 5: POST /veterinary/vaccinations');

  try {
    const response = await axios.post(
      `${BASE_URL}/veterinary/vaccinations`,
      {
        petId: petId,
        vaccineName: 'V10 (Múltipla)',
        manufacturer: 'Zoetis',
        batchNumber: 'BATCH-2025-001',
        applicationDate: new Date().toISOString().split('T')[0],
        nextDoseDate: (() => {
          const next = new Date();
          next.setMonth(next.getMonth() + 6);
          return next.toISOString().split('T')[0];
        })(),
        notes: 'Primeira dose',
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 201, 'Status deve ser 201');
    assert(response.data.id, 'Deve retornar ID');
    assert.strictEqual(response.data.vaccineName, 'V10 (Múltipla)', 'Nome deve corresponder');

    vaccinationId = response.data.id;

    console.log(`   ✅ Vacinação criada: ${vaccinationId}`);
    console.log(`   ✅ Vacina: ${response.data.vaccineName}`);
    console.log(`   ✅ Próxima dose: ${response.data.nextDoseDate}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 6: Listar vacinações do pet
async function test6_ListPetVaccinations() {
  console.log('\nTest 6: GET /veterinary/pets/:petId/vaccinations');

  try {
    const response = await axios.get(`${BASE_URL}/veterinary/pets/${petId}/vaccinations`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(Array.isArray(response.data), 'Deve retornar array');
    assert(response.data.length >= 1, 'Deve ter pelo menos 1 vacinação');

    console.log(`   ✅ ${response.data.length} vacinação(ões) encontrada(s)`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 7: Listar vacinações próximas
async function test7_UpcomingVaccinations() {
  console.log('\nTest 7: GET /veterinary/pets/:petId/vaccinations/upcoming');

  try {
    const response = await axios.get(
      `${BASE_URL}/veterinary/pets/${petId}/vaccinations/upcoming`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(Array.isArray(response.data), 'Deve retornar array');

    console.log(`   ✅ ${response.data.length} vacinação(ões) próxima(s)`);
    console.log('   ✅ Sistema de lembretes funcionando');
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function runAllTests() {
  console.log('=' .repeat(70));
  console.log('🧪 TESTES DE VETERINARY RECORDS');
  console.log('=' .repeat(70));

  try {
    await setup();
    await test1_CreateRecord();
    await test2_GetRecord();
    await test3_ListPetRecords();
    await test4_UpdateRecord();
    await test5_CreateVaccination();
    await test6_ListPetVaccinations();
    await test7_UpcomingVaccinations();

    console.log('\n' + '='.repeat(70));
    console.log('✅ TODOS OS TESTES DE VETERINARY PASSARAM!');
    console.log('='.repeat(70));
    console.log(`\n📊 Resumo:`);
    console.log(`   • 7 testes executados`);
    console.log(`   • 7 testes passaram`);
    console.log(`   • Record ID: ${recordId}`);
    console.log(`   • Vaccination ID: ${vaccinationId}`);
    console.log(`   • Prontuário completo: ✅\n`);

    return { success: true, recordId, vaccinationId };
  } catch (error) {
    console.error('\n❌ Falha nos testes de Veterinary');
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

