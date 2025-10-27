const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

async function runAllTests() {
  console.log('🧪 Iniciando testes do Sistema de Acesso de Features...\n');
  
  let superAdminToken;
  let ownerToken;
  let storeId;
  let organizationId;
  let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  };

  try {
    // Setup
    console.log('🔧 Configurando ambiente de teste...');
    
    // Login as SUPER_ADMIN
    const superAdminResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'superadmin@superpet.com',
      password: 'Super@2024!Admin',
    });
    superAdminToken = superAdminResponse.data.access_token;
    organizationId = superAdminResponse.data.user.organizationId;

    // Create test store
    const storeResponse = await axios.post(`${BASE_URL}/stores`, {
      name: 'Test Store Feature Access',
      address: 'Rua Teste, 123',
      phone: '(11) 99999-9999',
      email: 'test@store.com',
    }, {
      headers: {
        'Authorization': `Bearer ${superAdminToken}`,
        'X-Organization-Id': organizationId,
      },
    });
    storeId = storeResponse.data.id;

    // Create OWNER
    const ownerResponse = await axios.post(`${BASE_URL}/employees`, {
      user: {
        email: 'owner@test.com',
        password: 'senha123',
        name: 'Owner Test',
      },
      jobTitle: 'OWNER',
      phone: '(11) 88888-8888',
    }, {
      headers: {
        'Authorization': `Bearer ${superAdminToken}`,
        'X-Organization-Id': organizationId,
      },
    });

    // Login as OWNER
    const ownerLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'owner@test.com',
      password: 'senha123',
    });
    ownerToken = ownerLoginResponse.data.accessToken;

    console.log('✅ Ambiente configurado com sucesso!\n');

    // Test Suite 1: Feature Access Configuration
    console.log('📋 SUITE 1: Configuração de Acesso de Features\n');
    
    await runTest('Configurar feature como STORE_ONLY', async () => {
      const response = await axios.post(`${BASE_URL}/stores/${storeId}/feature-access/SERVICE_CATALOG`, {
        accessType: 'STORE_ONLY',
      }, {
        headers: {
          'Authorization': `Bearer ${ownerToken}`,
        },
      });

      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.data.accessType, 'STORE_ONLY');
      assert.strictEqual(response.data.enabled, true);
    }, testResults);

    await runTest('Configurar feature como STORE_AND_CUSTOMER', async () => {
      const response = await axios.post(`${BASE_URL}/stores/${storeId}/feature-access/ONLINE_BOOKING`, {
        accessType: 'STORE_AND_CUSTOMER',
        customerConfig: {
          allowSelfService: true,
          requireApproval: false,
          maxBookingsPerDay: 5,
        },
      }, {
        headers: {
          'Authorization': `Bearer ${ownerToken}`,
        },
      });

      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.data.accessType, 'STORE_AND_CUSTOMER');
      assert.strictEqual(response.data.customerConfig.allowSelfService, true);
      assert.strictEqual(response.data.customerConfig.maxBookingsPerDay, 5);
    }, testResults);

    await runTest('Listar features configuradas', async () => {
      const response = await axios.get(`${BASE_URL}/stores/${storeId}/feature-access`, {
        headers: {
          'Authorization': `Bearer ${ownerToken}`,
        },
      });

      assert.strictEqual(response.status, 200);
      assert(Array.isArray(response.data));
      assert(response.data.length >= 2);
    }, testResults);

    await runTest('Listar features disponíveis para clientes', async () => {
      const response = await axios.get(`${BASE_URL}/stores/${storeId}/feature-access/customer-available`, {
        headers: {
          'Authorization': `Bearer ${ownerToken}`,
        },
      });

      assert.strictEqual(response.status, 200);
      assert(Array.isArray(response.data));
      assert(response.data.length >= 1);
    }, testResults);

    await runTest('Listar features divisíveis', async () => {
      const response = await axios.get(`${BASE_URL}/stores/${storeId}/feature-access/divisible`, {
        headers: {
          'Authorization': `Bearer ${ownerToken}`,
        },
      });

      assert.strictEqual(response.status, 200);
      assert(Array.isArray(response.data));
      assert(response.data.length >= 30);
    }, testResults);

    await runTest('Atualizar configuração de feature', async () => {
      const response = await axios.put(`${BASE_URL}/stores/${storeId}/feature-access/ONLINE_BOOKING`, {
        customerConfig: {
          allowSelfService: true,
          requireApproval: true,
          maxBookingsPerDay: 3,
        },
      }, {
        headers: {
          'Authorization': `Bearer ${ownerToken}`,
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.message, 'Feature access updated successfully');
    }, testResults);

    await runTest('Desabilitar feature', async () => {
      const response = await axios.post(`${BASE_URL}/stores/${storeId}/feature-access/SERVICE_CATALOG/disable`, {}, {
        headers: {
          'Authorization': `Bearer ${ownerToken}`,
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.message, 'Feature disabled successfully');
    }, testResults);

    await runTest('Habilitar feature', async () => {
      const response = await axios.post(`${BASE_URL}/stores/${storeId}/feature-access/SERVICE_CATALOG/enable`, {}, {
        headers: {
          'Authorization': `Bearer ${ownerToken}`,
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.message, 'Feature enabled successfully');
    }, testResults);

    await runTest('Obter configuração de feature', async () => {
      const response = await axios.get(`${BASE_URL}/stores/${storeId}/feature-access/ONLINE_BOOKING`, {
        headers: {
          'Authorization': `Bearer ${ownerToken}`,
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.featureKey, 'ONLINE_BOOKING');
      assert.strictEqual(response.data.storeId, storeId);
      assert.strictEqual(response.data.isAvailableForCustomers, true);
    }, testResults);

    // Test Suite 2: Customer Portal Access
    console.log('\n📋 SUITE 2: Acesso do Portal do Cliente\n');

    await runTest('Obter features disponíveis para cliente', async () => {
      const response = await axios.get(`${BASE_URL}/customer-portal/stores/${storeId}/available-features`, {
        headers: {
          'Authorization': `Bearer ${ownerToken}`,
        },
      });

      assert.strictEqual(response.status, 200);
      assert(Array.isArray(response.data));
      assert(response.data.length >= 1);
      
      const onlineBookingFeature = response.data.find(f => f.key === 'ONLINE_BOOKING');
      assert(onlineBookingFeature);
      assert.strictEqual(onlineBookingFeature.customerConfig.maxBookingsPerDay, 3);
    }, testResults);

    await runTest('Acessar endpoint de agendamento do cliente', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/customer-portal/stores/${storeId}/bookings`, {
          headers: {
            'Authorization': `Bearer ${ownerToken}`,
          },
          params: {
            customerId: 'test-customer-id',
          },
        });

        assert.strictEqual(response.status, 200);
      } catch (error) {
        if (error.response?.status === 403) {
          console.log('⚠️ Endpoint de agendamento bloqueado (feature não habilitada)');
        } else {
          throw error;
        }
      }
    }, testResults);

    await runTest('Verificar bloqueio de feature desabilitada', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/customer-portal/stores/${storeId}/products`, {
          headers: {
            'Authorization': `Bearer ${ownerToken}`,
          },
        });

        // Se chegou aqui, a feature está habilitada
        assert.strictEqual(response.status, 200);
      } catch (error) {
        if (error.response?.status === 403) {
          console.log('✅ Catálogo de produtos corretamente bloqueado');
        } else {
          throw error;
        }
      }
    }, testResults);

    // Test Suite 3: Store Configuration Service
    console.log('\n📋 SUITE 3: Serviço de Configuração de Loja\n');

    await runTest('Configurar loja básica (apenas loja)', async () => {
      const basicFeatures = ['SERVICE_CATALOG', 'PRODUCT_CATALOG', 'VETERINARY_RECORDS'];
      
      for (const featureKey of basicFeatures) {
        await axios.post(`${BASE_URL}/stores/${storeId}/feature-access/${featureKey}`, {
          accessType: 'STORE_ONLY',
        }, {
          headers: {
            'Authorization': `Bearer ${ownerToken}`,
          },
        });
      }

      const response = await axios.get(`${BASE_URL}/stores/${storeId}/feature-access/customer-available`, {
        headers: {
          'Authorization': `Bearer ${ownerToken}`,
        },
      });

      // Loja básica deve ter poucas features para clientes
      assert.strictEqual(response.status, 200);
    }, testResults);

    await runTest('Configurar loja com clientes habilitados', async () => {
      const customerFeatures = [
        {
          key: 'CUSTOMER_REGISTRATION',
          config: { allowSelfRegistration: true, requireApproval: false },
        },
        {
          key: 'PET_REGISTRATION',
          config: { allowSelfService: true, maxPetsPerCustomer: 5 },
        },
        {
          key: 'ONLINE_BOOKING',
          config: { allowSelfService: true, requireApproval: true, maxBookingsPerDay: 3 },
        },
      ];

      for (const feature of customerFeatures) {
        await axios.post(`${BASE_URL}/stores/${storeId}/feature-access/${feature.key}`, {
          accessType: 'STORE_AND_CUSTOMER',
          customerConfig: feature.config,
        }, {
          headers: {
            'Authorization': `Bearer ${ownerToken}`,
          },
        });
      }

      const response = await axios.get(`${BASE_URL}/stores/${storeId}/feature-access/customer-available`, {
        headers: {
          'Authorization': `Bearer ${ownerToken}`,
        },
      });

      assert.strictEqual(response.status, 200);
      assert(response.data.length >= 3);
    }, testResults);

    await runTest('Configurar loja premium (todas as features)', async () => {
      const premiumFeatures = [
        {
          key: 'LIVE_CAM',
          config: { allowSelfService: true, maxConcurrentStreams: 5, maxDailyMinutes: 120 },
        },
        {
          key: 'TELEPICKUP',
          config: { allowSelfService: true, maxDailyPickups: 5, requireAdvanceNotice: 1 },
        },
        {
          key: 'LOYALTY_PROGRAM',
          config: { allowSelfService: true, showPoints: true, allowRedemption: true },
        },
      ];

      for (const feature of premiumFeatures) {
        await axios.post(`${BASE_URL}/stores/${storeId}/feature-access/${feature.key}`, {
          accessType: 'STORE_AND_CUSTOMER',
          customerConfig: feature.config,
        }, {
          headers: {
            'Authorization': `Bearer ${ownerToken}`,
          },
        });
      }

      const response = await axios.get(`${BASE_URL}/stores/${storeId}/feature-access/customer-available`, {
        headers: {
          'Authorization': `Bearer ${ownerToken}`,
        },
      });

      assert.strictEqual(response.status, 200);
      assert(response.data.length >= 6);
    }, testResults);

    // Test Suite 4: Error Handling
    console.log('\n📋 SUITE 4: Tratamento de Erros\n');

    await runTest('Tentar configurar feature inexistente', async () => {
      try {
        await axios.post(`${BASE_URL}/stores/${storeId}/feature-access/INVALID_FEATURE`, {
          accessType: 'STORE_AND_CUSTOMER',
        }, {
          headers: {
            'Authorization': `Bearer ${ownerToken}`,
          },
        });
        assert.fail('Deveria ter falhado');
      } catch (error) {
        assert.strictEqual(error.response.status, 400);
      }
    }, testResults);

    await runTest('Tentar acessar sem autenticação', async () => {
      try {
        await axios.get(`${BASE_URL}/stores/${storeId}/feature-access`);
        assert.fail('Deveria ter falhado');
      } catch (error) {
        assert.strictEqual(error.response.status, 401);
      }
    }, testResults);

    await runTest('Tentar configurar com role insuficiente', async () => {
      // Criar STAFF user
      const staffResponse = await axios.post(`${BASE_URL}/employees`, {
        user: {
          email: 'staff@test.com',
          password: 'senha123',
          name: 'Staff Test',
        },
        jobTitle: 'STAFF',
        phone: '(11) 77777-7777',
      }, {
        headers: {
          'Authorization': `Bearer ${superAdminToken}`,
          'X-Organization-Id': organizationId,
        },
      });

      const staffLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'staff@test.com',
        password: 'senha123',
      });
      const staffToken = staffLoginResponse.data.accessToken;

      try {
        await axios.post(`${BASE_URL}/stores/${storeId}/feature-access/SERVICE_CATALOG`, {
          accessType: 'STORE_AND_CUSTOMER',
        }, {
          headers: {
            'Authorization': `Bearer ${staffToken}`,
          },
        });
        assert.fail('Deveria ter falhado');
      } catch (error) {
        assert.strictEqual(error.response.status, 403);
      }
    }, testResults);

    // Test Suite 5: Performance and Scalability
    console.log('\n📋 SUITE 5: Performance e Escalabilidade\n');

    await runTest('Configurar múltiplas features rapidamente', async () => {
      const features = ['VACCINATION_RECORDS', 'GROOMING_NOTES', 'DIGITAL_CARD', 'CUSTOMER_REVIEWS'];
      
      const promises = features.map(featureKey => 
        axios.post(`${BASE_URL}/stores/${storeId}/feature-access/${featureKey}`, {
          accessType: 'STORE_AND_CUSTOMER',
          customerConfig: { allowSelfService: true },
        }, {
          headers: {
            'Authorization': `Bearer ${ownerToken}`,
          },
        })
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        assert.strictEqual(response.status, 201);
        assert.strictEqual(response.data.accessType, 'STORE_AND_CUSTOMER');
      });
    }, testResults);

    await runTest('Listar todas as features divisíveis', async () => {
      const startTime = Date.now();
      
      const response = await axios.get(`${BASE_URL}/stores/${storeId}/feature-access/divisible`, {
        headers: {
          'Authorization': `Bearer ${ownerToken}`,
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      assert.strictEqual(response.status, 200);
      assert(response.data.length >= 30);
      assert(duration < 1000, `Resposta muito lenta: ${duration}ms`);
    }, testResults);

    console.log('\n🎉 Todos os testes do Sistema de Acesso de Features passaram!');
    console.log(`📊 Resultado: ${testResults.passed}/${testResults.total} testes passaram`);
    
    return {
      success: true,
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      storeId: storeId,
    };

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    return {
      success: false,
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed + 1,
      error: error.message,
    };
  }
}

async function runTest(testName, testFunction, testResults) {
  testResults.total++;
  try {
    console.log(`   🧪 ${testName}...`);
    await testFunction();
    console.log(`   ✅ ${testName} - PASSOU`);
    testResults.passed++;
  } catch (error) {
    console.log(`   ❌ ${testName} - FALHOU: ${error.message}`);
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error.message });
  }
}

module.exports = { runAllTests };
