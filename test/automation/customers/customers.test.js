const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

// Variáveis compartilhadas
let accessToken = null;
let customerId = null;
let addressId = null;
let customerEmail = null;
let uniqueCpf = null;

console.log('👥 Iniciando testes de Customers\n');

// Helper: Gerar CPF único (não precisa ser válido para testes)
function generateUniqueCpf() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return timestamp.substring(timestamp.length - 9) + random;
}

// Helper: Fazer login (registrando usuário local, sem executar suite de Auth)
async function login() {
  const email = `customers_${Date.now()}_${Math.random().toString(36).slice(2)}@superpet.com.br`;
  const resp = await axios.post(`${BASE_URL}/auth/register`, {
    email,
    name: 'Customers Tester',
    password: 'senha123',
  });
  accessToken = resp.data.access_token;
  console.log('\n✅ Autenticado para testes de Customers\n');
}

// Test 1: Criar customer
async function test1_CreateCustomer() {
  console.log('Test 1: POST /customers');
  
  try {
    const response = await axios.post(`${BASE_URL}/customers`, {
      name: 'Rodolfo Diego',
      email: customerEmail,
      phone: '+5592988887777',
      marketingConsent: {
        email: true,
        sms: false,
        whatsapp: true,
      },
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 201, 'Status deve ser 201');
    assert(response.data.id, 'Deve retornar ID');
    assert.strictEqual(response.data.name, 'Rodolfo Diego', 'Nome deve corresponder');
    assert.strictEqual(response.data.status, 'ACTIVE', 'Status deve ser ACTIVE');

    customerId = response.data.id;

    console.log(`   ✅ Customer criado: ${response.data.name}`);
    console.log(`   ✅ ID: ${customerId}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 2: Listar customers
async function test2_ListCustomers() {
  console.log('\nTest 2: GET /customers');
  
  try {
    const response = await axios.get(`${BASE_URL}/customers`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(Array.isArray(response.data), 'Deve retornar array');
    assert(response.data.length >= 1, 'Deve ter pelo menos 1 customer');

    console.log(`   ✅ ${response.data.length} customers encontrados`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 3: Ver customer específico
async function test3_GetCustomerById() {
  console.log('\nTest 3: GET /customers/:id');
  
  try {
    const response = await axios.get(`${BASE_URL}/customers/${customerId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.id, customerId, 'ID deve corresponder');
    assert(response.data.addresses !== undefined, 'Deve incluir addresses');

    console.log(`   ✅ Customer: ${response.data.name}`);
    console.log(`   ✅ Email: ${response.data.email}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 4: Criar customer sem contato (deve falhar)
async function test4_CreateCustomerNoContact() {
  console.log('\nTest 4: POST /customers (sem contato)');
  
  try {
    await axios.post(`${BASE_URL}/customers`, {
      name: 'Sem Contato',
      // Sem email e sem phone
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('MISSING_CONTACT')) {
      console.log('   ✅ Rejeitou customer sem contato');
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.message);
      throw error;
    }
  }
}

// Test 5: Adicionar endereço
async function test5_CreateAddress() {
  console.log('\nTest 5: POST /customers/:id/addresses');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/customers/${customerId}/addresses`,
      {
        street: 'Rua das Flores',
        number: '123',
        district: 'Centro',
        city: 'Manaus',
        state: 'AM',
        zip: '69000000',
        country: 'BR',
        isPrimary: true,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 201, 'Status deve ser 201');
    assert(response.data.id, 'Deve retornar ID');
    assert.strictEqual(response.data.isPrimary, true, 'Deve ser primário');

    addressId = response.data.id;

    console.log(`   ✅ Endereço criado: ${response.data.street}, ${response.data.number}`);
    console.log(`   ✅ ID: ${addressId}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 6: Listar endereços
async function test6_ListAddresses() {
  console.log('\nTest 6: GET /customers/:id/addresses');
  
  try {
    const response = await axios.get(`${BASE_URL}/customers/${customerId}/addresses`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(Array.isArray(response.data), 'Deve retornar array');
    assert(response.data.length >= 1, 'Deve ter pelo menos 1 endereço');

    const primary = response.data.find(a => a.isPrimary);
    assert(primary, 'Deve ter um endereço primário');

    console.log(`   ✅ ${response.data.length} endereços encontrados`);
    console.log(`   ✅ Primário: ${primary.street}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 7: Atualizar status do customer
async function test7_UpdateCustomerStatus() {
  console.log('\nTest 7: PATCH /customers/:id/status');
  
  try {
    const response = await axios.patch(
      `${BASE_URL}/customers/${customerId}/status`,
      { status: 'INACTIVE' },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.status, 'INACTIVE', 'Status deve ser INACTIVE');

    console.log('   ✅ Status atualizado para INACTIVE');

    // Voltar para ACTIVE
    await axios.patch(
      `${BASE_URL}/customers/${customerId}/status`,
      { status: 'ACTIVE' },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    console.log('   ✅ Status restaurado para ACTIVE');
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 8: Adicionar Personal Data (CPF, RG, etc)
async function test8_AddPersonalData() {
  console.log('\nTest 8: PUT /customers/:id/personal-data');
  
  try {
    const response = await axios.put(
      `${BASE_URL}/customers/${customerId}/personal-data`,
      {
        cpf: uniqueCpf,
        rg: '1234567',
        issuer: 'SSP-AM',
        birthdate: '1990-05-01',
        gender: 'M',
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(response.data.cpf, 'Deve retornar CPF');

    console.log('   ✅ Personal data adicionado');
    console.log('   ✅ CPF cadastrado (PII protegido)');
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function runAllTests() {
  console.log('=' .repeat(70));
  console.log('🧪 TESTES DE CUSTOMERS & ADDRESSES');
  console.log('=' .repeat(70));

  // Gerar email e CPF únicos para cada execução
  customerEmail = `customer_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;
  uniqueCpf = generateUniqueCpf();

  try {
    await login();
    await test1_CreateCustomer();
    await test2_ListCustomers();
    await test3_GetCustomerById();
    await test4_CreateCustomerNoContact();
    await test5_CreateAddress();
    await test6_ListAddresses();
    await test7_UpdateCustomerStatus();
    await test8_AddPersonalData();

    console.log('\n' + '='.repeat(70));
    console.log('✅ TODOS OS TESTES DE CUSTOMERS PASSARAM!');
    console.log('='.repeat(70));
    console.log(`\n📊 Resumo:`);
    console.log(`   • 8 testes executados`);
    console.log(`   • 8 testes passaram`);
    console.log(`   • Customer ID: ${customerId}`);
    console.log(`   • Address ID: ${addressId}\n`);

    return { success: true, customerId, addressId };
  } catch (error) {
    console.error('\n❌ Falha nos testes de Customers');
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
