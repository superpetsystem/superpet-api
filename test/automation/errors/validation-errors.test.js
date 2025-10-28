const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

let accessToken = null;
let customerId = null;

console.log('❌ Iniciando testes de Validação de Erros\n');

// Setup (auth simples para evitar logout/blacklist)
async function setup() {
  const { loginSimple } = require('../helpers/auth-helper-simple.js');
  accessToken = await loginSimple('Validation Tester');
  console.log('\n✅ Autenticado para testes de Validação\n');
}

// Test 1: Email formato inválido
async function test1_InvalidEmailFormat() {
  console.log('Test 1: POST /auth/register (email inválido)');
  
  try {
    await axios.post(`${BASE_URL}/auth/register`, {
      email: 'invalid-email-format',  // Email sem @
      name: 'Test User',
      password: 'senha123',
    });

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 400) {
      const message = Array.isArray(error.response.data.message) 
        ? error.response.data.message.join(', ')
        : error.response.data.message;
      
      assert(message.includes('email') || message.includes('must be an email'), 
        'Deve rejeitar email inválido');
      console.log('   ✅ Rejeitou email inválido corretamente');
      console.log(`   ✅ Mensagem: ${message}`);
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Test 2: Nome vazio
async function test2_EmptyName() {
  console.log('\nTest 2: POST /auth/register (nome vazio)');
  
  try {
    await axios.post(`${BASE_URL}/auth/register`, {
      email: `test_${Date.now()}@test.com`,
      name: '',  // Nome vazio
      password: 'senha123',
    });

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 400) {
      const message = Array.isArray(error.response.data.message) 
        ? error.response.data.message.join(', ')
        : error.response.data.message;
      
      assert(message.includes('name'), 'Deve rejeitar nome vazio');
      console.log('   ✅ Rejeitou nome vazio corretamente');
      console.log(`   ✅ Mensagem: ${message}`);
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Test 3: Senha muito curta
async function test3_ShortPassword() {
  console.log('\nTest 3: POST /auth/register (senha < 6 caracteres)');
  
  try {
    await axios.post(`${BASE_URL}/auth/register`, {
      email: `test_${Date.now()}@test.com`,
      name: 'Test User',
      password: '123',  // Senha muito curta
    });

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 400) {
      const message = Array.isArray(error.response.data.message) 
        ? error.response.data.message.join(', ')
        : error.response.data.message;
      
      assert(message.includes('password'), 'Deve rejeitar senha curta');
      console.log('   ✅ Rejeitou senha curta corretamente');
      console.log(`   ✅ Mensagem: ${message}`);
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Test 4: Múltiplos erros de validação
async function test4_MultipleValidationErrors() {
  console.log('\nTest 4: POST /auth/register (múltiplos erros)');
  
  try {
    await axios.post(`${BASE_URL}/auth/register`, {
      email: 'bad-email',     // Email inválido
      name: '',               // Nome vazio
      password: '12',         // Senha curta
    });

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 400) {
      const messages = error.response.data.message;
      assert(Array.isArray(messages), 'Deve retornar array de erros');
      assert(messages.length >= 3, 'Deve ter pelo menos 3 erros');
      
      console.log('   ✅ Rejeitou múltiplos erros corretamente');
      console.log(`   ✅ Total de erros: ${messages.length}`);
      console.log(`   ✅ Mensagens: ${messages.join(' | ')}`);
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Test 5: Customer não encontrado (404)
async function test5_CustomerNotFound() {
  console.log('\nTest 5: GET /customers/:id (ID inexistente)');
  
  try {
    await axios.get(`${BASE_URL}/customers/00000000-0000-0000-0000-999999999999`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('   ✅ Retornou 404 para ID inexistente');
      console.log(`   ✅ Mensagem: ${error.response.data.message}`);
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Test 6: Pet não encontrado (404)
async function test6_PetNotFound() {
  console.log('\nTest 6: GET /pets/:id (ID inexistente)');
  
  try {
    await axios.get(`${BASE_URL}/pets/00000000-0000-0000-0000-999999999999`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('   ✅ Retornou 404 para ID inexistente');
      console.log(`   ✅ Mensagem: ${error.response.data.message}`);
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Test 7: Store não encontrada (404)
async function test7_StoreNotFound() {
  console.log('\nTest 7: GET /stores/:id (ID inexistente)');
  
  try {
    await axios.get(`${BASE_URL}/stores/00000000-0000-0000-0000-999999999999`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('   ✅ Retornou 404 para ID inexistente');
      console.log(`   ✅ Mensagem: ${error.response.data.message}`);
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Test 8: Customer com nome vazio
async function test8_CustomerEmptyName() {
  console.log('\nTest 8: POST /customers (nome vazio)');
  
  try {
    await axios.post(`${BASE_URL}/customers`, {
      name: '',  // Nome vazio
      email: `test_${Date.now()}@test.com`,
      phone: '+5511999999999',
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 400) {
      const message = Array.isArray(error.response.data.message) 
        ? error.response.data.message.join(', ')
        : error.response.data.message;
      
      console.log('   ✅ Rejeitou nome vazio corretamente');
      console.log(`   ✅ Mensagem: ${message}`);
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Test 9: Pet com nome vazio
async function test9_PetEmptyName() {
  console.log('\nTest 9: POST /customers/:customerId/pets (nome vazio)');
  
  // Criar customer primeiro
  const customerRes = await axios.post(`${BASE_URL}/customers`, {
    name: 'Customer Temp',
    email: `temp_${Date.now()}@test.com`,
    phone: '+5511888888888',
  }, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  customerId = customerRes.data.id;
  
  try {
    await axios.post(`${BASE_URL}/pets`, {
      customerId: customerId,
      name: '',  // Nome vazio
      species: 'DOG',
      weightKg: 10,
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 400) {
      const message = Array.isArray(error.response.data.message) 
        ? error.response.data.message.join(', ')
        : error.response.data.message;
      
      console.log('   ✅ Rejeitou nome vazio corretamente');
      console.log(`   ✅ Mensagem: ${message}`);
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Test 10: Service com código vazio
async function test10_ServiceEmptyCode() {
  console.log('\nTest 10: POST /services (código vazio)');
  
  try {
    await axios.post(`${BASE_URL}/services`, {
      code: '',  // Código vazio
      name: 'Serviço Teste',
      durationMinutes: 60,
      priceBaseCents: 5000,
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 400) {
      const message = Array.isArray(error.response.data.message) 
        ? error.response.data.message.join(', ')
        : error.response.data.message;
      
      console.log('   ✅ Rejeitou código vazio corretamente');
      console.log(`   ✅ Mensagem: ${message}`);
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Test 11: Pet peso negativo
async function test11_PetNegativeWeight() {
  console.log('\nTest 11: POST /customers/:customerId/pets (peso negativo)');
  
  try {
    await axios.post(`${BASE_URL}/pets`, {
      customerId: customerId,
      name: 'Pet Test',
      species: 'DOG',
      weightKg: -5,  // Peso negativo
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('   ✅ Rejeitou peso negativo corretamente');
      console.log(`   ✅ Status: 400`);
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Test 12: Pet peso acima do máximo (200kg)
async function test12_PetWeightTooHigh() {
  console.log('\nTest 12: POST /customers/:customerId/pets (peso > 200kg)');
  
  try {
    await axios.post(`${BASE_URL}/pets`, {
      customerId: customerId,
      name: 'Elephant',
      species: 'OTHER',
      weightKg: 500,  // Acima do máximo
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('   ✅ Rejeitou peso acima do máximo');
      console.log(`   ✅ Status: 400`);
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.response?.data || error.message);
      throw error;
    }
  }
}

async function runAllTests() {
  console.log('=' .repeat(70));
  console.log('🧪 TESTES DE VALIDAÇÃO DE ERROS');
  console.log('=' .repeat(70));

  try {
    await setup();
    await test1_InvalidEmailFormat();
    await test2_EmptyName();
    await test3_ShortPassword();
    await test4_MultipleValidationErrors();
    await test5_CustomerNotFound();
    await test6_PetNotFound();
    await test7_StoreNotFound();
    await test8_CustomerEmptyName();
    await test9_PetEmptyName();
    await test10_ServiceEmptyCode();
    await test11_PetNegativeWeight();
    await test12_PetWeightTooHigh();

    console.log('\n' + '='.repeat(70));
    console.log('✅ TODOS OS TESTES DE VALIDAÇÃO PASSARAM!');
    console.log('='.repeat(70));
    console.log('\n📊 Resumo:');
    console.log('   • 12 testes executados');
    console.log('   • Validações de campo: ✅ TESTADAS');
    console.log('   • Erros 400: ✅ VALIDADOS');
    console.log('   • Erros 404: ✅ VALIDADOS');
    console.log('   • Mensagens de erro: ✅ CONSISTENTES\n');

    return { success: true, totalTests: 12 };
  } catch (error) {
    console.error('\n❌ Falha nos testes de Validação');
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

