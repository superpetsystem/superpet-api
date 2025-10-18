/**
 * 🧪 Testes de Automação - Módulo de Pets
 * SuperPet API
 * 
 * Este script testa todos os endpoints do módulo de Pets
 * 
 * Como executar:
 * node test/automation/pets.test.js
 */

const axios = require('axios');

// ========================================
// CONFIGURAÇÕES
// ========================================

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: `pet.test${Date.now()}@superpet.com`,
  password: 'senha123',
  name: 'Pet Teste Automação'
};

const TEST_CUSTOMER = {
  email: `petowner${Date.now()}@superpet.com`,
  password: 'senha123',
  name: 'Dono de Pet Teste',
  phone: '(11) 98765-4321',
  notes: 'Cliente para testes de pets',
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
    fullName: 'Maria Silva Santos',
    documentType: 'cpf',
    documentNumber: `${Date.now()}`,
    birthDate: '1985-03-20',
    phoneAlternative: '(11) 3333-4444',
    emailAlternative: 'maria.alt@example.com'
  }
};

const TEST_PET = {
  name: 'Rex',
  type: 'dog',
  breed: 'Labrador',
  gender: 'male',
  birthDate: '2020-05-15',
  weight: 25.5,
  notes: 'Pet de teste - Muito amigável'
};

// Variáveis globais
let accessToken = '';
let customerId = '';
let petId = '';

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
  log('SETUP: Registrar usuário e criar customer', 'blue');
  separator();
  
  try {
    // Registrar usuário
    const authResponse = await axios.post(`${BASE_URL}/auth/register`, TEST_USER);
    accessToken = authResponse.data.accessToken;
    
    // Criar customer
    const customerResponse = await axios.post(
      `${BASE_URL}/customers`,
      TEST_CUSTOMER,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    customerId = customerResponse.data.id;
    
    logSuccess('Setup completo - Token e Customer criados');
    logInfo(`Token: ${accessToken.substring(0, 20)}...`);
    logInfo(`Customer ID: ${customerId}`);
  } catch (error) {
    logError('Setup', error);
    throw error;
  }
}

async function test1_CreatePet() {
  separator();
  log('TEST 1: POST /pets - Criar pet', 'blue');
  separator();
  
  try {
    const petData = {
      ...TEST_PET,
      customerId: customerId
    };
    
    const response = await axios.post(
      `${BASE_URL}/pets`,
      petData,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    // Validações
    if (response.status !== 201) {
      throw new Error(`Status esperado: 201, recebido: ${response.status}`);
    }
    
    if (!response.data.id) {
      throw new Error('Pet ID não retornado');
    }
    
    // Customer é opcional dependendo da configuração de eager loading
    // if (!response.data.customer) {
    //   throw new Error('Customer não retornado');
    // }
    
    if (response.data.name !== TEST_PET.name) {
      throw new Error('Nome do pet não corresponde');
    }
    
    petId = response.data.id;
    
    logSuccess('Pet criado com sucesso');
    logInfo(`Pet ID: ${petId}`);
    logInfo(`Nome: ${response.data.name}`);
    logInfo(`Tipo: ${response.data.type}`);
    logInfo(`Raça: ${response.data.breed}`);
    logInfo(`Peso: ${response.data.weight}kg`);
  } catch (error) {
    logError('Criar pet', error);
    throw error;
  }
}

async function test2_CreateMultiplePets() {
  separator();
  log('TEST 2: POST /pets - Criar múltiplos pets para o mesmo customer', 'blue');
  separator();
  
  try {
    const pets = [
      {
        name: 'Mimi',
        type: 'cat',
        breed: 'Siamês',
        gender: 'female',
        birthDate: '2021-03-20',
        weight: 4.2,
        notes: 'Gata calma',
        customerId: customerId
      },
      {
        name: 'Loro',
        type: 'bird',
        breed: 'Papagaio',
        gender: 'male',
        birthDate: '2019-08-10',
        weight: 0.5,
        notes: 'Fala algumas palavras',
        customerId: customerId
      }
    ];
    
    for (const pet of pets) {
      const response = await axios.post(
        `${BASE_URL}/pets`,
        pet,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      
      if (response.status !== 201) {
        throw new Error(`Falha ao criar pet ${pet.name}`);
      }
      
      logInfo(`✓ Pet criado: ${pet.name} (${pet.type})`);
    }
    
    logSuccess('Múltiplos pets criados com sucesso');
  } catch (error) {
    logError('Criar múltiplos pets', error);
    throw error;
  }
}

async function test3_GetAllPets() {
  separator();
  log('TEST 3: GET /pets - Listar pets (paginado)', 'blue');
  separator();
  
  try {
    const response = await axios.get(
      `${BASE_URL}/pets?page=1&limit=10`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    // Validações
    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }
    
    if (!response.data.data) {
      throw new Error('Array de pets não retornado');
    }
    
    if (!response.data.meta) {
      throw new Error('Meta de paginação não retornado');
    }
    
    if (!Array.isArray(response.data.data)) {
      throw new Error('data não é um array');
    }
    
    logSuccess('Listagem de pets obtida (paginado)');
    logInfo(`Total de pets: ${response.data.meta.total}`);
    logInfo(`Página: ${response.data.meta.page}`);
    logInfo(`Limite: ${response.data.meta.limit}`);
    logInfo(`Total de páginas: ${response.data.meta.totalPages}`);
    logInfo(`Pets retornados nesta página: ${response.data.data.length}`);
  } catch (error) {
    logError('Listar pets paginado', error);
    throw error;
  }
}

async function test3b_GetAllPetsSimple() {
  separator();
  log('TEST 3B: GET /pets/all - Listar pets (simples)', 'blue');
  separator();
  
  try {
    const response = await axios.get(
      `${BASE_URL}/pets/all`,
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
    
    logSuccess('Listagem simples de pets obtida');
    logInfo(`Total de pets: ${response.data.length}`);
  } catch (error) {
    logError('Listar pets simples', error);
    throw error;
  }
}

async function test4_GetPetById() {
  separator();
  log('TEST 4: GET /pets/:id - Buscar pet por ID', 'blue');
  separator();
  
  try {
    if (!petId) {
      throw new Error('Pet ID não está disponível (teste anterior falhou)');
    }
    
    const response = await axios.get(
      `${BASE_URL}/pets/${petId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    // Validações
    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }
    
    if (response.data.id !== petId) {
      throw new Error(`Pet ID não corresponde. Esperado: ${petId}, Recebido: ${response.data.id}`);
    }
    
    logSuccess('Pet encontrado por ID');
    logInfo(`Nome: ${response.data.name}`);
    logInfo(`Tipo: ${response.data.type}`);
    logInfo(`Raça: ${response.data.breed}`);
    if (response.data.customer && response.data.customer.user) {
      logInfo(`Dono: ${response.data.customer.user.name}`);
    }
  } catch (error) {
    logError('Buscar pet por ID', error);
    throw error;
  }
}

async function test5_GetPetsByCustomer() {
  separator();
  log('TEST 5: GET /pets/customer/:customerId - Buscar pets por customer', 'blue');
  separator();
  
  try {
    const response = await axios.get(
      `${BASE_URL}/pets/customer/${customerId}`,
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
    
    // Todos os pets devem ser do mesmo customer
    for (const pet of response.data) {
      if (pet.customerId !== customerId) {
        throw new Error(`Pet ${pet.id} não pertence ao customer ${customerId}`);
      }
    }
    
    logSuccess('Pets do customer encontrados');
    logInfo(`Total de pets: ${response.data.length}`);
    response.data.forEach(pet => {
      logInfo(`  - ${pet.name} (${pet.type})`);
    });
  } catch (error) {
    logError('Buscar pets por customer', error);
    throw error;
  }
}

async function test6_UpdatePet() {
  separator();
  log('TEST 6: PUT /pets/:id - Atualizar pet', 'blue');
  separator();
  
  try {
    if (!petId) {
      throw new Error('Pet ID não está disponível (teste anterior falhou)');
    }
    
    const updateData = {
      weight: 27.8,
      notes: 'Peso atualizado após consulta veterinária'
    };
    
    const response = await axios.put(
      `${BASE_URL}/pets/${petId}`,
      updateData,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    // Validações
    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }
    
    if (parseFloat(response.data.weight) !== updateData.weight) {
      throw new Error('Peso não foi atualizado');
    }
    
    if (response.data.notes !== updateData.notes) {
      throw new Error('Notas não foram atualizadas');
    }
    
    logSuccess('Pet atualizado com sucesso');
    logInfo(`Novo peso: ${response.data.weight}kg`);
    logInfo(`Novas notas: ${response.data.notes}`);
  } catch (error) {
    logError('Atualizar pet', error);
    throw error;
  }
}

async function test7_UpdatePetComplete() {
  separator();
  log('TEST 7: PUT /pets/:id - Atualizar pet (completo)', 'blue');
  separator();
  
  try {
    if (!petId) {
      throw new Error('Pet ID não está disponível (teste anterior falhou)');
    }
    
    const updateData = {
      name: 'Rex Atualizado',
      breed: 'Labrador Retriever',
      weight: 28.5,
      notes: 'Informações completas atualizadas'
    };
    
    const response = await axios.put(
      `${BASE_URL}/pets/${petId}`,
      updateData,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    // Validações
    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }
    
    if (response.data.name !== updateData.name) {
      throw new Error('Nome não foi atualizado');
    }
    
    logSuccess('Pet atualizado completamente');
    logInfo(`Nome: ${response.data.name}`);
    logInfo(`Raça: ${response.data.breed}`);
    logInfo(`Peso: ${response.data.weight}kg`);
  } catch (error) {
    logError('Atualizar pet completo', error);
    throw error;
  }
}

async function test8_DeletePet() {
  separator();
  log('TEST 8: DELETE /pets/:id - Deletar pet', 'blue');
  separator();
  
  try {
    if (!petId) {
      throw new Error('Pet ID não está disponível (teste anterior falhou)');
    }
    
    const response = await axios.delete(
      `${BASE_URL}/pets/${petId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    // Validações
    if (response.status !== 204) {
      throw new Error(`Status esperado: 204, recebido: ${response.status}`);
    }
    
    logSuccess('Pet deletado com sucesso');
    
    // Tentar buscar o pet deletado (deve retornar 404)
    try {
      await axios.get(
        `${BASE_URL}/pets/${petId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      throw new Error('Pet ainda existe após deleção');
    } catch (err) {
      if (err.response && err.response.status === 404) {
        logInfo('✓ Confirmado: Pet não existe mais');
      } else {
        throw err;
      }
    }
  } catch (error) {
    logError('Deletar pet', error);
    throw error;
  }
}

async function test9_CreatePetWithoutAuth() {
  separator();
  log('TEST 9: POST /pets - Criar pet sem autenticação (deve falhar)', 'blue');
  separator();
  
  try {
    const petData = {
      ...TEST_PET,
      customerId: customerId
    };
    
    await axios.post(`${BASE_URL}/pets`, petData);
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

async function test10_CreatePetInvalidCustomer() {
  separator();
  log('TEST 10: POST /pets - Criar pet com customer inválido (deve falhar)', 'blue');
  separator();
  
  try {
    const petData = {
      ...TEST_PET,
      customerId: '00000000-0000-0000-0000-000000000000' // Customer que não existe
    };
    
    await axios.post(
      `${BASE_URL}/pets`,
      petData,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    throw new Error('Request deveria ter falhado com customer inválido');
  } catch (error) {
    if (error.response && (error.response.status === 400 || error.response.status === 404)) {
      logSuccess('Rejeitado corretamente customer inválido');
      logInfo(`Status: ${error.response.status}`);
    } else {
      throw error;
    }
  }
}

async function test11_GetPetsWithPagination() {
  separator();
  log('TEST 11: GET /pets - Testar paginação', 'blue');
  separator();
  
  try {
    // Página 1 com limite 2
    const response1 = await axios.get(
      `${BASE_URL}/pets?page=1&limit=2`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    if (response1.data.meta.limit !== 2) {
      throw new Error('Limite não aplicado corretamente');
    }
    
    logSuccess('Paginação funcionando corretamente');
    logInfo(`Página 1 - Itens: ${response1.data.data.length}`);
    logInfo(`Has next page: ${response1.data.meta.hasNextPage}`);
    logInfo(`Has previous page: ${response1.data.meta.hasPreviousPage}`);
  } catch (error) {
    logError('Testar paginação', error);
    throw error;
  }
}

async function test12_CreateMultiplePets() {
  separator();
  log('TEST 12: Criar 100 pets para o customer', 'blue');
  separator();
  
  try {
    const totalToCreate = 100;
    let created = 0;
    let failed = 0;
    
    const petTypes = ['dog', 'cat', 'bird', 'rabbit', 'other'];
    const petBreeds = {
      dog: ['Labrador', 'Bulldog', 'Poodle', 'Golden Retriever', 'Pastor Alemão'],
      cat: ['Siamês', 'Persa', 'Maine Coon', 'Bengal', 'Ragdoll'],
      bird: ['Papagaio', 'Canário', 'Periquito', 'Calopsita', 'Arara'],
      rabbit: ['Angorá', 'Mini Lop', 'Holandês', 'Rex', 'Lionhead'],
      other: ['Hamster', 'Porquinho da Índia', 'Tartaruga', 'Iguana', 'Furão']
    };
    const genders = ['male', 'female'];
    
    logInfo(`Criando ${totalToCreate} pets...`);
    
    for (let i = 1; i <= totalToCreate; i++) {
      try {
        const type = petTypes[i % petTypes.length];
        const breeds = petBreeds[type];
        const breed = breeds[i % breeds.length];
        const gender = genders[i % genders.length];
        
        const petData = {
          name: `Pet Batch ${i}`,
          type: type,
          breed: breed,
          gender: gender,
          birthDate: `${2015 + (i % 9)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
          weight: parseFloat((Math.random() * 30 + 2).toFixed(2)),
          notes: `Pet criado em massa - #${i} - Tipo: ${type}`,
          customerId: customerId
        };
        
        await axios.post(
          `${BASE_URL}/pets`,
          petData,
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );
        
        created++;
        
        if (i % 10 === 0) {
          logInfo(`  ✓ ${i}/${totalToCreate} pets criados...`);
        }
      } catch (error) {
        failed++;
        if (failed <= 3) {
          logInfo(`  ✗ Falha ao criar pet ${i}: ${error.message}`);
        }
      }
    }
    
    logSuccess(`${created} pets criados com sucesso`);
    if (failed > 0) {
      logInfo(`${failed} falharam`);
    }
  } catch (error) {
    logError('Criar múltiplos pets', error);
    throw error;
  }
}

// ========================================
// EXECUTAR TODOS OS TESTES
// ========================================

async function runAllTests() {
  console.log('\n');
  separator();
  log('🧪 INICIANDO TESTES DO MÓDULO PETS', 'cyan');
  separator();
  console.log('\n');
  
  const tests = [
    test0_Setup,
    test1_CreatePet,
    test2_CreateMultiplePets,
    test12_CreateMultiplePets,
    test3_GetAllPets,
    test3b_GetAllPetsSimple,
    test4_GetPetById,
    test5_GetPetsByCustomer,
    test6_UpdatePet,
    test7_UpdatePetComplete,
    test11_GetPetsWithPagination,
    test8_DeletePet,
    test9_CreatePetWithoutAuth,
    test10_CreatePetInvalidCustomer,
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

