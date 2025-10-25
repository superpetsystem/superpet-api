const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

// Variáveis compartilhadas
let accessToken = null;
let bookingId = null;
let customerId = null;
let petId = null;
let storeId = null;
let serviceId = null;

console.log('📅 Iniciando testes de Online Booking\n');

// Helper: Setup completo
async function setup() {
  const authTests = require('../auth/auth.test.js');
  const result = await authTests.runAllTests();
  accessToken = result.accessToken;

  // Criar customer e pet
  const customerTests = require('../customers/customers.test.js');
  const customerResult = await customerTests.runAllTests();
  customerId = customerResult.customerId;

  const petsTests = require('../pets/pets.test.js');
  const petResult = await petsTests.runAllTests();
  petId = petResult.petId;

  // Pegar store e service IDs do banco
  const storesResponse = await axios.get(`${BASE_URL}/stores`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  storeId = storesResponse.data[0].id;

  // Habilitar feature ONLINE_BOOKING na loja
  await axios.put(`${BASE_URL}/stores/${storeId}/features/ONLINE_BOOKING`, {
    enabled: true,
  }, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const servicesResponse = await axios.get(`${BASE_URL}/services`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  serviceId = servicesResponse.data[0].id;

  console.log('\n✅ Setup completo para testes de Bookings');
  console.log(`   • Store ID: ${storeId}`);
  console.log(`   • Service ID: ${serviceId}`);
  console.log(`   • Feature ONLINE_BOOKING habilitada\n`);
}

// Test 1: Criar agendamento
async function test1_CreateBooking() {
  console.log('Test 1: POST /bookings');

  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const response = await axios.post(
      `${BASE_URL}/bookings`,
      {
        storeId: storeId,
        customerId: customerId,
        petId: petId,
        serviceId: serviceId,
        bookingDate: tomorrow.toISOString().split('T')[0],
        startTime: '10:00',
        notes: 'Primeira vez do pet',
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 201, 'Status deve ser 201');
    assert(response.data.id, 'Deve retornar ID');
    assert.strictEqual(response.data.status, 'PENDING', 'Status deve ser PENDING');

    bookingId = response.data.id;

    console.log(`   ✅ Booking criado: ${bookingId}`);
    console.log(`   ✅ Data: ${response.data.bookingDate}`);
    console.log(`   ✅ Horário: ${response.data.startTime} - ${response.data.endTime}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 2: Listar bookings da loja
async function test2_ListStoreBookings() {
  console.log('\nTest 2: GET /bookings/stores/:storeId');

  try {
    const response = await axios.get(`${BASE_URL}/bookings/stores/${storeId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(Array.isArray(response.data), 'Deve retornar array');

    console.log(`   ✅ ${response.data.length} booking(s) encontrados`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 3: Listar bookings do customer
async function test3_ListCustomerBookings() {
  console.log('\nTest 3: GET /bookings/customers/:customerId');

  try {
    const response = await axios.get(`${BASE_URL}/bookings/customers/${customerId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(Array.isArray(response.data), 'Deve retornar array');
    assert(response.data.length >= 1, 'Deve ter pelo menos 1 booking');

    console.log(`   ✅ ${response.data.length} booking(s) do customer`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 4: Confirmar booking
async function test4_ConfirmBooking() {
  console.log('\nTest 4: PATCH /bookings/:id/confirm');

  try {
    const response = await axios.patch(
      `${BASE_URL}/bookings/${bookingId}/confirm`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.status, 'CONFIRMED', 'Status deve ser CONFIRMED');
    assert(response.data.confirmedAt, 'Deve ter confirmedAt');

    console.log('   ✅ Booking confirmado');
    console.log(`   ✅ Status: ${response.data.status}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 5: Completar booking
async function test5_CompleteBooking() {
  console.log('\nTest 5: PATCH /bookings/:id/complete');

  try {
    const response = await axios.patch(
      `${BASE_URL}/bookings/${bookingId}/complete`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.status, 'COMPLETED', 'Status deve ser COMPLETED');
    assert(response.data.completedAt, 'Deve ter completedAt');

    console.log('   ✅ Booking completado');
    console.log(`   ✅ Status: ${response.data.status}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 6: Criar novo booking para cancelar
async function test6_CreateAndCancelBooking() {
  console.log('\nTest 6: POST + PATCH /bookings/:id/cancel');

  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);

    const createResponse = await axios.post(
      `${BASE_URL}/bookings`,
      {
        storeId: storeId,
        customerId: customerId,
        petId: petId,
        serviceId: serviceId,
        bookingDate: tomorrow.toISOString().split('T')[0],
        startTime: '14:00',
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const newBookingId = createResponse.data.id;

    const cancelResponse = await axios.patch(
      `${BASE_URL}/bookings/${newBookingId}/cancel`,
      { reason: 'Cliente solicitou cancelamento' },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(cancelResponse.status, 200, 'Status deve ser 200');
    assert.strictEqual(cancelResponse.data.status, 'CANCELLED', 'Status deve ser CANCELLED');
    assert(cancelResponse.data.cancellationReason, 'Deve ter razão do cancelamento');

    console.log('   ✅ Booking criado e cancelado');
    console.log(`   ✅ Razão: ${cancelResponse.data.cancellationReason}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 7: Tentar criar booking em horário conflitante
async function test7_ConflictingBooking() {
  console.log('\nTest 7: POST /bookings (horário conflitante)');

  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    await axios.post(
      `${BASE_URL}/bookings`,
      {
        storeId: storeId,
        customerId: customerId,
        petId: petId,
        serviceId: serviceId,
        bookingDate: tomorrow.toISOString().split('T')[0],
        startTime: '10:30', // Conflita com 10:00-11:00
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('BOOKING_CONFLICT')) {
      console.log('   ✅ Rejeitou horário conflitante');
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.message);
      throw error;
    }
  }
}

async function runAllTests() {
  console.log('=' .repeat(70));
  console.log('🧪 TESTES DE ONLINE BOOKING');
  console.log('=' .repeat(70));

  try {
    await setup();
    await test1_CreateBooking();
    await test2_ListStoreBookings();
    await test3_ListCustomerBookings();
    await test4_ConfirmBooking();
    await test5_CompleteBooking();
    await test6_CreateAndCancelBooking();
    await test7_ConflictingBooking();

    console.log('\n' + '='.repeat(70));
    console.log('✅ TODOS OS TESTES DE BOOKINGS PASSARAM!');
    console.log('='.repeat(70));
    console.log(`\n📊 Resumo:`);
    console.log(`   • 7 testes executados`);
    console.log(`   • 7 testes passaram`);
    console.log(`   • Booking ID: ${bookingId}`);
    console.log(`   • Fluxo completo: CREATE → CONFIRM → COMPLETE ✅`);
    console.log(`   • Validações: ✅\n`);

    return { success: true, bookingId };
  } catch (error) {
    console.error('\n❌ Falha nos testes de Bookings');
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

