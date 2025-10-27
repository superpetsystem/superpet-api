const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

console.log('🎯 Iniciando testes de Divisão STORE/CUSTOMER para Features...\n');

async function runAllTests() {
  let accessToken, storeId;
  let passed = 0, failed = 0;

  try {
    // 1. Login
    console.log('1. Fazendo login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'superadmin@superpet.com',
      password: 'Super@2024!Admin',
    });
    accessToken = loginRes.data.access_token;
    console.log('✅ Login realizado\n');

    // 2. Criar loja
    console.log('2. Criando loja...');
    const storeRes = await axios.post(`${BASE_URL}/stores`, {
      code: `TEST_STORE_${Date.now()}`,
      name: 'Loja Test SaaS',
      timezone: 'America/Manaus',
      openingHours: {
        mon: [['08:00', '18:00']],
        tue: [['08:00', '18:00']],
        wed: [['08:00', '18:00']],
        thu: [['08:00', '18:00']],
        fri: [['08:00', '18:00']],
      },
      resourcesCatalog: ['GROOMER'],
      capacity: { GROOMER: 2 },
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    storeId = storeRes.data.id;
    console.log(`✅ Loja criada: ${storeId}\n`);

    // TESTE 1: Feature divisível cria STORE + CUSTOMER
    console.log('TESTE 1: Feature divisível cria STORE + CUSTOMER');
    try {
      const response = await axios.post(`${BASE_URL}/stores/${storeId}/features`, {
        featureKey: 'SERVICE_CATALOG',
        enabled: true,
        storeLimits: { maxServicesPerDay: 50 },
        customerLimits: { allowSelfService: true, maxDailyUsage: 5 },
      }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      assert.strictEqual(response.status, 201);
      assert(Array.isArray(response.data));
      assert.strictEqual(response.data.length, 2); // STORE + CUSTOMER
      
      const storeEntry = response.data.find(e => e.accessType === 'STORE');
      const customerEntry = response.data.find(e => e.accessType === 'CUSTOMER');
      
      assert(storeEntry, 'Deve ter entrada STORE');
      assert(customerEntry, 'Deve ter entrada CUSTOMER');
      assert(storeEntry.enabled, 'Entrada STORE deve estar habilitada');
      assert(customerEntry.enabled, 'Entrada CUSTOMER deve estar habilitada');

      console.log('   ✅ Feature divisível criou 2 entradas (STORE + CUSTOMER)\n');
      passed++;
    } catch (error) {
      console.error(`   ❌ Falhou: ${error.response?.data?.message || error.message}\n`);
      failed++;
    }

    // TESTE 2: Feature não divisível cria apenas STORE
    console.log('TESTE 2: Feature não divisível cria apenas STORE');
    try {
      const response = await axios.post(`${BASE_URL}/stores/${storeId}/features`, {
        featureKey: 'PDV_POINT_OF_SALE',
        enabled: true,
        storeLimits: { maxTransactionsPerDay: 100 },
      }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      assert.strictEqual(response.status, 201);
      assert(Array.isArray(response.data));
      assert.strictEqual(response.data.length, 1); // Apenas STORE
      assert.strictEqual(response.data[0].accessType, 'STORE');

      console.log('   ✅ Feature não divisível criou 1 entrada (STORE apenas)\n');
      passed++;
    } catch (error) {
      console.error(`   ❌ Falhou: ${error.response?.data?.message || error.message}\n`);
      failed++;
    }

    // TESTE 3: GET features para funcionários
    console.log('TESTE 3: GET features para funcionários');
    try {
      const response = await axios.get(`${BASE_URL}/stores/${storeId}/features`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      assert.strictEqual(response.status, 200);
      assert(Array.isArray(response.data));
      
      const storeFeatures = response.data.filter(f => f.accessType === 'STORE');
      assert(storeFeatures.length >= 2, 'Deve ter pelo menos 2 features STORE');

      console.log(`   ✅ ${response.data.length} features para funcionários\n`);
      passed++;
    } catch (error) {
      console.error(`   ❌ Falhou: ${error.response?.data?.message || error.message}\n`);
      failed++;
    }

    // TESTE 4: GET features para clientes
    console.log('TESTE 4: GET features para clientes');
    try {
      const response = await axios.get(`${BASE_URL}/stores/${storeId}/features/customer`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      assert.strictEqual(response.status, 200);
      assert(Array.isArray(response.data));
      
      const customerFeatures = response.data.filter(f => f.accessType === 'CUSTOMER');
      assert(customerFeatures.length >= 1, 'Deve ter pelo menos 1 feature CUSTOMER');

      console.log(`   ✅ ${response.data.length} features para clientes\n`);
      passed++;
    } catch (error) {
      console.error(`   ❌ Falhou: ${error.response?.data?.message || error.message}\n`);
      failed++;
    }

    // TESTE 5: Verificar isolamento STORE vs CUSTOMER
    console.log('TESTE 5: Verificar isolamento STORE vs CUSTOMER');
    try {
      const storeResponse = await axios.get(`${BASE_URL}/stores/${storeId}/features`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const customerResponse = await axios.get(`${BASE_URL}/stores/${storeId}/features/customer`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      assert(Array.isArray(storeResponse.data));
      assert(Array.isArray(customerResponse.data));
      
      // Features STORE não devem aparecer em customer
      customerResponse.data.forEach(f => {
        assert.strictEqual(f.accessType, 'CUSTOMER');
      });

      // Features CUSTOMER não devem aparecer em store
      storeResponse.data.forEach(f => {
        assert.strictEqual(f.accessType, 'STORE');
      });

      console.log('   ✅ Isolamento STORE/CUSTOMER validado\n');
      passed++;
    } catch (error) {
      console.error(`   ❌ Falhou: ${error.response?.data?.message || error.message}\n`);
      failed++;
    }

    // RESUMO
    console.log('\n' + '='.repeat(70));
    console.log(`📊 RESULTADOS:`);
    console.log(`   ✅ Passou: ${passed}`);
    console.log(`   ❌ Falhou: ${failed}`);
    console.log(`   📈 Total: ${passed + failed}`);
    console.log('='.repeat(70) + '\n');

    if (failed === 0) {
      console.log('🎉 TODOS OS TESTES PASSARAM!');
      return { success: true, passed, failed };
    } else {
      console.log('⚠️  ALGUNS TESTES FALHARAM');
      return { success: false, passed, failed };
    }

  } catch (error) {
    console.error('❌ Erro nos testes:', error.response?.data || error.message);
    return { success: false, passed, failed };
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests };
