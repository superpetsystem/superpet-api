const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

// Variáveis compartilhadas
let accessToken = null;
let storeId = null;

console.log('📊 Iniciando testes de Reports Dashboard\n');

// Helper: Fazer login
async function login() {
  const { loginSimple } = require('../helpers/auth-helper-simple.js');
  accessToken = await loginSimple('Reports Tester');
  console.log('\n✅ Autenticado para testes de Reports\n');
}

// Helper: Criar loja com feature habilitada
async function createStoreWithFeature() {
  console.log('🏪 Criando loja com feature REPORTS_DASHBOARD...');
  
  try {
    // Criar loja
    const storeResponse = await axios.post(`${BASE_URL}/stores`, {
      code: `REP_STORE_${Date.now()}`,
      name: 'Loja Reports Test',
      timezone: 'America/Manaus',
      openingHours: { mon: [['08:00', '18:00']] },
      resourcesCatalog: ['GROOMER'],
      capacity: { GROOMER: 2 },
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    storeId = storeResponse.data.id;
    console.log(`   ✅ Loja criada: ${storeId}`);

    // Habilitar feature REPORTS_DASHBOARD
    await axios.put(`${BASE_URL}/stores/${storeId}/features/REPORTS_DASHBOARD`, {
      enabled: true,
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(`   ✅ Feature REPORTS_DASHBOARD habilitada`);
  } catch (error) {
    console.error('   ❌ Erro ao criar loja:', error.response?.data || error.message);
    throw error;
  }
}

// Test 1: Dashboard overview
async function test1_DashboardOverview() {
  console.log('Test 1: GET /reports/dashboard');
  
  try {
    const response = await axios.get(`${BASE_URL}/reports/dashboard`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(response.data.customers !== undefined, 'Deve ter total de customers');
    assert(response.data.pets !== undefined, 'Deve ter total de pets');
    assert(response.data.stores !== undefined, 'Deve ter total de stores');

    console.log('   ✅ Dashboard overview gerado');
    console.log(`   ✅ Customers: ${response.data.customers}`);
    console.log(`   ✅ Pets: ${response.data.pets}`);
    console.log(`   ✅ Stores: ${response.data.stores}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 2: Relatório de customers
async function test2_CustomerReport() {
  console.log('\nTest 2: GET /reports/customers?period=MONTH');
  
  try {
    const response = await axios.get(`${BASE_URL}/reports/customers`, {
      params: { period: 'MONTH' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(response.data.period, 'Deve ter período');
    assert(response.data.totalCustomers !== undefined, 'Deve ter total');
    assert(response.data.newCustomers !== undefined, 'Deve ter novos');

    console.log('   ✅ Relatório de customers gerado');
    console.log(`   ✅ Período: ${response.data.period}`);
    console.log(`   ✅ Novos no período: ${response.data.newCustomers}`);
    console.log(`   ✅ Total: ${response.data.totalCustomers}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 3: Relatório de pets
async function test3_PetReport() {
  console.log('\nTest 3: GET /reports/pets?period=WEEK');
  
  try {
    const response = await axios.get(`${BASE_URL}/reports/pets`, {
      params: { period: 'WEEK' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(response.data.totalPets !== undefined, 'Deve ter total de pets');
    assert(response.data.bySpecies, 'Deve ter breakdown por espécie');

    console.log('   ✅ Relatório de pets gerado');
    console.log(`   ✅ Total: ${response.data.totalPets}`);
    console.log(`   ✅ Por espécie:`, JSON.stringify(response.data.bySpecies));
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 4: Performance da loja
async function test4_StorePerformance() {
  console.log('\nTest 4: GET /reports/stores/:storeId/performance');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/reports/stores/${storeId}/performance`,
      {
        params: { period: 'MONTH' },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(response.data.store, 'Deve ter dados da loja');
    assert(response.data.metrics, 'Deve ter métricas');

    console.log('   ✅ Performance da loja gerada');
    console.log(`   ✅ Loja: ${response.data.store.name}`);
    console.log(`   ✅ Período: ${response.data.period}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 5: Relatório com período customizado
async function test5_CustomPeriodReport() {
  console.log('\nTest 5: GET /reports/customers (período customizado)');
  
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const response = await axios.get(`${BASE_URL}/reports/customers`, {
      params: {
        period: 'CUSTOM',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.period, 'CUSTOM', 'Período deve ser CUSTOM');

    console.log('   ✅ Relatório com período customizado');
    console.log(`   ✅ Start: ${new Date(response.data.startDate).toLocaleDateString()}`);
    console.log(`   ✅ End: ${new Date(response.data.endDate).toLocaleDateString()}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 6: Filtrar produtos por categoria
async function test6_FilterByCategory() {
  console.log('\nTest 6: GET /inventory/products?category=HYGIENE');
  
  try {
    const response = await axios.get(`${BASE_URL}/inventory/products`, {
      params: { category: 'HYGIENE' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    
    // Verificar que todos são da categoria HYGIENE
    response.data.forEach(product => {
      assert.strictEqual(product.category, 'HYGIENE', 'Todos devem ser HYGIENE');
    });

    console.log(`   ✅ ${response.data.length} produto(s) HYGIENE encontrados`);
    console.log('   ✅ Filtro por categoria funcionando');
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function runAllTests() {
  console.log('=' .repeat(70));
  console.log('🧪 TESTES DE INVENTORY & REPORTS');
  console.log('=' .repeat(70));

  try {
    await login();
    await createStoreWithFeature();
    await test1_DashboardOverview();
    await test2_CustomerReport();
    await test3_PetReport();
    await test4_StorePerformance();
    await test5_CustomPeriodReport();
    await test6_FilterByCategory();

    console.log('\n' + '='.repeat(70));
    console.log('✅ TODOS OS TESTES DE REPORTS PASSARAM!');
    console.log('='.repeat(70));
    console.log(`\n📊 Resumo:`);
    console.log(`   • 6 testes executados`);
    console.log(`   • 6 testes passaram`);
    console.log(`   • Dashboard: ✅`);
    console.log(`   • Relatórios: ✅\n`);

    return { success: true };
  } catch (error) {
    console.error('\n❌ Falha nos testes de Reports');
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

