/**
 * 🧪 Testes de Automação - Módulo de Customers
 * SuperPet API
 * 
 * Este script testa todos os endpoints do módulo de Customers
 * 
 * Como executar:
 * node test/automation/customers.test.js
 */

const axios = require('axios');

// ========================================
// CONFIGURAÇÕES
// ========================================

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: `customer.test${Date.now()}@superpet.com`,
  password: 'senha123',
  name: 'Customer Teste Automação'
};

const TEST_CUSTOMER = {
  email: `customer${Date.now()}@superpet.com`,
  password: 'senha123',
  name: 'João Silva Teste',
  phone: '(11) 98765-4321',
  notes: 'Cliente de teste automação',
  address: {
    zipCode: '01310-100',
    street: 'Avenida Paulista',
    number: '1000',
    complement: 'Apto 101',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil'
  },
  personData: {
    fullName: 'João da Silva Santos',
    documentType: 'cpf',
    documentNumber: `${Date.now()}`,
    birthDate: '1990-05-15',
    phoneAlternative: '(11) 3333-4444',
    emailAlternative: 'joao.alt@example.com'
  }
};

// Variáveis globais
let accessToken = '';
let customerId = '';
let customerEmail = '';

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function log(message, color = 'reset') {
  const prefix = {
    reset: '',
    green: '✅ ',
    red: '❌ ',
    yellow: '⚠️  ',
    blue: '🔵 ',
    cyan: '💡 ',
  };
  console.log(`${prefix[color] || ''}${message}`);
}

function logSuccess(test) {
  console.log(`✅ PASSOU: ${test}`);
}

function logError(test, error) {
  console.log(`❌ FALHOU: ${test}`);
  if (error.response) {
    console.log(`   Status: ${error.response.status}`);
    console.log(`   Message: ${JSON.stringify(error.response.data)}`);
  } else {
    console.log(`   Error: ${error.message}`);
  }
}

function logInfo(message) {
  console.log(`   ${message}`);
}

function separator() {
  console.log('='.repeat(80));
}

// ========================================
// TESTES
// ========================================

async function test0_Setup() {
  separator();
  log('SETUP: Registrar usuário para obter token', 'blue');
  separator();
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, TEST_USER);
    accessToken = response.data.accessToken;
    
    logSuccess('Setup completo - Token obtido');
    logInfo(`Token: ${accessToken.substring(0, 20)}...`);
  } catch (error) {
    logError('Setup', error);
    throw error;
  }
}

async function test1_CreateCustomer() {
  separator();
  log('TEST 1: POST /customers - Criar customer', 'blue');
  separator();
  
  try {
    const response = await axios.post(
      `${BASE_URL}/customers`,
      TEST_CUSTOMER,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    // Validações
    if (response.status !== 201) {
      throw new Error(`Status esperado: 201, recebido: ${response.status}`);
    }
    
    if (!response.data.id) {
      throw new Error('Customer ID não retornado');
    }
    
    if (!response.data.user) {
      throw new Error('User não retornado');
    }
    
    if (!response.data.address) {
      throw new Error('Address não retornado');
    }
    
    if (!response.data.personData) {
      throw new Error('PersonData não retornado');
    }
    
    customerId = response.data.id;
    customerEmail = response.data.user.email;
    
    logSuccess('Customer criado com sucesso');
    logInfo(`Customer ID: ${customerId}`);
    logInfo(`Email: ${customerEmail}`);
    logInfo(`Nome: ${response.data.user.name}`);
    logInfo(`Endereço: ${response.data.address.street}, ${response.data.address.number}`);
    logInfo(`Documento: ${response.data.personData.documentNumber}`);
  } catch (error) {
    logError('Criar customer', error);
    throw error;
  }
}

async function test2_GetAllCustomers() {
  separator();
  log('TEST 2: GET /customers - Listar customers (paginado)', 'blue');
  separator();
  
  try {
    const response = await axios.get(
      `${BASE_URL}/customers?page=1&limit=10`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    // Validações
    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }
    
    if (!response.data.data) {
      throw new Error('Array de customers não retornado');
    }
    
    if (!response.data.meta) {
      throw new Error('Meta de paginação não retornado');
    }
    
    if (!Array.isArray(response.data.data)) {
      throw new Error('data não é um array');
    }
    
    logSuccess('Listagem de customers obtida (paginado)');
    logInfo(`Total de customers: ${response.data.meta.total}`);
    logInfo(`Página: ${response.data.meta.page}`);
    logInfo(`Limite: ${response.data.meta.limit}`);
    logInfo(`Total de páginas: ${response.data.meta.totalPages}`);
  } catch (error) {
    logError('Listar customers paginado', error);
    throw error;
  }
}

async function test2b_GetAllCustomersSimple() {
  separator();
  log('TEST 2B: GET /customers/all - Listar customers (simples)', 'blue');
  separator();
  
  try {
    const response = await axios.get(
      `${BASE_URL}/customers/all`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    // Validações
    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }
    
    if (!Array.isArray(response.data)) {
      throw new Error('Resposta não é um array');
    }
    
    // Não deve ter meta (paginação)
    if (response.data.meta !== undefined) {
      throw new Error('Não deveria retornar meta na listagem simples');
    }
    
    logSuccess('Listagem simples de customers obtida');
    logInfo(`Total de customers: ${response.data.length}`);
  } catch (error) {
    logError('Listar customers simples', error);
    throw error;
  }
}

async function test3_GetCustomerById() {
  separator();
  log('TEST 3: GET /customers/:id - Buscar customer por ID', 'blue');
  separator();
  
  try {
    const response = await axios.get(
      `${BASE_URL}/customers/${customerId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    // Validações
    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }
    
    if (response.data.id !== customerId) {
      throw new Error('Customer ID não corresponde');
    }
    
    logSuccess('Customer encontrado por ID');
    logInfo(`Nome: ${response.data.user.name}`);
    logInfo(`Email: ${response.data.user.email}`);
    logInfo(`Telefone: ${response.data.phone}`);
  } catch (error) {
    logError('Buscar customer por ID', error);
    throw error;
  }
}

async function test4_GetCustomerByEmail() {
  separator();
  log('TEST 4: GET /customers/email/:email - Buscar customer por email', 'blue');
  separator();
  
  try {
    const response = await axios.get(
      `${BASE_URL}/customers/email/${customerEmail}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    // Validações
    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }
    
    if (response.data.user.email !== customerEmail) {
      throw new Error('Email não corresponde');
    }
    
    logSuccess('Customer encontrado por email');
    logInfo(`Nome: ${response.data.user.name}`);
    logInfo(`ID: ${response.data.id}`);
  } catch (error) {
    logError('Buscar customer por email', error);
    throw error;
  }
}

async function test5_UpdateCustomer() {
  separator();
  log('TEST 5: PUT /customers/:id - Atualizar customer', 'blue');
  separator();
  
  try {
    const updateData = {
      name: 'João Silva Atualizado',
      phone: '(11) 99999-8888',
      notes: 'Notas atualizadas',
      address: {
        complement: 'Apto 202',
      },
      personData: {
        phoneAlternative: '(11) 4444-5555',
      }
    };
    
    const response = await axios.put(
      `${BASE_URL}/customers/${customerId}`,
      updateData,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    // Validações
    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }
    
    if (response.data.user.name !== updateData.name) {
      throw new Error('Nome não foi atualizado');
    }
    
    if (response.data.phone !== updateData.phone) {
      throw new Error('Telefone não foi atualizado');
    }
    
    logSuccess('Customer atualizado com sucesso');
    logInfo(`Novo nome: ${response.data.user.name}`);
    logInfo(`Novo telefone: ${response.data.phone}`);
    logInfo(`Novas notas: ${response.data.notes}`);
  } catch (error) {
    logError('Atualizar customer', error);
    throw error;
  }
}

async function test6_DeleteCustomer() {
  separator();
  log('TEST 6: DELETE /customers/:id - Deletar customer', 'blue');
  separator();
  
  try {
    const response = await axios.delete(
      `${BASE_URL}/customers/${customerId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    // Validações
    if (response.status !== 204) {
      throw new Error(`Status esperado: 204, recebido: ${response.status}`);
    }
    
    logSuccess('Customer deletado com sucesso');
    
    // Tentar buscar o customer deletado (deve retornar 404)
    try {
      await axios.get(
        `${BASE_URL}/customers/${customerId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      throw new Error('Customer ainda existe após deleção');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        logInfo('✓ Confirmado: Customer não existe mais');
      } else {
        throw err;
      }
    }
  } catch (error) {
    logError('Deletar customer', error);
    throw error;
  }
}

async function test7_CreateCustomerWithoutAuth() {
  separator();
  log('TEST 7: POST /customers - Criar customer sem autenticação (deve falhar)', 'blue');
  separator();
  
  try {
    await axios.post(`${BASE_URL}/customers`, TEST_CUSTOMER);
    throw new Error('Request deveria ter falhado sem autenticação');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logSuccess('Rejeitado corretamente sem autenticação');
      logInfo('Status: 401 Unauthorized');
    } else {
      throw error;
    }
  }
}

async function test8_CreateCustomerDuplicate() {
  separator();
  log('TEST 8: POST /customers - Criar customer com email duplicado (deve falhar)', 'blue');
  separator();
  
  try {
    // Criar primeiro customer
    const customer1 = {
      ...TEST_CUSTOMER,
      email: `duplicate${Date.now()}@test.com`,
      personData: {
        ...TEST_CUSTOMER.personData,
        documentNumber: `${Date.now()}-1`
      }
    };
    
    await axios.post(
      `${BASE_URL}/customers`,
      customer1,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    // Tentar criar segundo com mesmo email
    const customer2 = {
      ...TEST_CUSTOMER,
      email: customer1.email,
      personData: {
        ...TEST_CUSTOMER.personData,
        documentNumber: `${Date.now()}-2`
      }
    };
    
    await axios.post(
      `${BASE_URL}/customers`,
      customer2,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    throw new Error('Request deveria ter falhado com email duplicado');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logSuccess('Rejeitado corretamente email duplicado');
      logInfo('Status: 400 Bad Request');
    } else {
      throw error;
    }
  }
}

async function test9_CreateMultipleCustomers() {
  separator();
  log('TEST 9: Criar 100 customers', 'blue');
  separator();
  
  try {
    const totalToCreate = 100;
    let created = 0;
    let failed = 0;
    
    logInfo(`Criando ${totalToCreate} customers...`);
    
    for (let i = 1; i <= totalToCreate; i++) {
      try {
        const customerData = {
          email: `customer.batch${Date.now()}.${i}@superpet.com`,
          password: 'senha123',
          name: `Customer Batch ${i}`,
          phone: `(11) 9${String(i).padStart(4, '0')}-${String(i).padStart(4, '0')}`,
          notes: `Cliente criado em massa - #${i}`,
          address: {
            zipCode: `${String(i).padStart(5, '0')}-${String(i).padStart(3, '0')}`,
            street: `Rua Teste ${i}`,
            number: String(i * 10),
            complement: i % 2 === 0 ? `Apto ${i}` : null,
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            country: 'Brasil'
          },
          personData: {
            fullName: `Cliente Batch Full Name ${i}`,
            documentType: 'cpf',
            documentNumber: `${Date.now()}${String(i).padStart(5, '0')}`,
            birthDate: '1990-01-01',
            phoneAlternative: i % 3 === 0 ? `(11) 3${String(i).padStart(3, '0')}-${String(i).padStart(4, '0')}` : null,
            emailAlternative: i % 2 === 0 ? `alt${i}@example.com` : null
          }
        };
        
        await axios.post(
          `${BASE_URL}/customers`,
          customerData,
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );
        
        created++;
        
        if (i % 10 === 0) {
          logInfo(`  ✓ ${i}/${totalToCreate} customers criados...`);
        }
      } catch (error) {
        failed++;
        if (failed <= 3) {
          logInfo(`  ✗ Falha ao criar customer ${i}: ${error.message}`);
        }
      }
    }
    
    logSuccess(`${created} customers criados com sucesso`);
    if (failed > 0) {
      logInfo(`${failed} falharam`);
    }
  } catch (error) {
    logError('Criar múltiplos customers', error);
    throw error;
  }
}

// ========================================
// EXECUTAR TODOS OS TESTES
// ========================================

async function runAllTests() {
  console.log('\n');
  separator();
  log('🧪 INICIANDO TESTES DO MÓDULO CUSTOMERS', 'cyan');
  separator();
  console.log('\n');
  
  const tests = [
    test0_Setup,
    test1_CreateCustomer,
    test2_GetAllCustomers,
    test2b_GetAllCustomersSimple,
    test3_GetCustomerById,
    test4_GetCustomerByEmail,
    test5_UpdateCustomer,
    test9_CreateMultipleCustomers,
    test6_DeleteCustomer,
    test7_CreateCustomerWithoutAuth,
    test8_CreateCustomerDuplicate,
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      await test();
      passed++;
      console.log('\n');
    } catch (error) {
      failed++;
      console.log('\n');
      // Continua executando os outros testes
    }
  }
  
  // Resumo
  separator();
  log('📊 RESUMO DOS TESTES', 'cyan');
  separator();
  log(`Total de testes: ${tests.length}`, 'blue');
  log(`Passou: ${passed}`, 'green');
  log(`Falhou: ${failed}`, 'red');
  separator();
  
  if (failed === 0) {
    log('🎉 TODOS OS TESTES PASSARAM!', 'green');
  } else {
    log(`⚠️  ${failed} teste(s) falharam`, 'yellow');
  }
  
  separator();
  
  process.exit(failed > 0 ? 1 : 0);
}

// Executar
runAllTests().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});

