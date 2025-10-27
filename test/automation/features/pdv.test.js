const SaasHelper = require('../core/helpers/saas-helper');
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

class PdvFeatureTests {
  constructor() {
    this.saasHelper = new SaasHelper();
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runAllTests() {
    console.log('🛒 INICIANDO TESTES DA FEATURE PDV');
    console.log('=' .repeat(60));

    try {
      await this.testPdvFeatureBlocking();
      await this.testPdvFeatureEnabling();
      await this.testPdvCompleteFlow();
      await this.testPdvSaasIsolation();
      await this.testPdvFeatureDisabling();

      this.printResults();
    } catch (error) {
      console.error('❌ Erro geral nos testes de PDV:', error.message);
    }
  }

  async testPdvFeatureBlocking() {
    console.log('\n1. 🧪 Testando bloqueio sem feature habilitada...');
    
    try {
      const env = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Tentar criar carrinho sem feature habilitada
      try {
        await axios.post(`${BASE_URL}/pdv/carts`, {
          storeId: env.store.id,
          customerId: env.customer.id,
        }, {
          headers: this.saasHelper.getHeaders(env.ownerToken, env.organization.id)
        });
        
        this.addResult('Bloqueio sem Feature', false, 'Carrinho foi criado sem feature habilitada');
      } catch (error) {
        if (error.response?.status === 403 && error.response?.data?.message === 'FEATURE_NOT_ENABLED') {
          this.addResult('Bloqueio sem Feature', true, 'Feature bloqueou criação do carrinho (403 FEATURE_NOT_ENABLED)');
        } else {
          this.addResult('Bloqueio sem Feature', false, `Resposta inesperada: ${error.response?.status} - ${error.response?.data?.message}`);
        }
      }
    } catch (error) {
      this.addResult('Bloqueio sem Feature', false, error.message);
    }
  }

  async testPdvFeatureEnabling() {
    console.log('\n2. 🧪 Testando habilitação da feature PDV...');
    
    try {
      const env = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Habilitar feature PDV
      await this.saasHelper.enableFeatureForStore(
        env.ownerToken, 
        env.store.id, 
        'PDV_POINT_OF_SALE',
        {
          maxConcurrentCarts: 50,
          maxItemsPerCart: 100,
          maxDailyTransactions: 1000,
        }
      );
      
      // Verificar se feature está habilitada
      const isEnabled = await this.saasHelper.isFeatureEnabled(
        env.ownerToken, 
        env.store.id, 
        'PDV_POINT_OF_SALE'
      );
      
      if (isEnabled) {
        this.addResult('Habilitação da Feature PDV', true, 'Feature PDV habilitada com sucesso');
      } else {
        this.addResult('Habilitação da Feature PDV', false, 'Feature PDV não foi habilitada');
      }
    } catch (error) {
      this.addResult('Habilitação da Feature PDV', false, error.message);
    }
  }

  async testPdvCompleteFlow() {
    console.log('\n3. 🧪 Testando fluxo completo do PDV...');
    
    try {
      const env = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Habilitar feature PDV
      await this.saasHelper.enableFeatureForStore(
        env.ownerToken, 
        env.store.id, 
        'PDV_POINT_OF_SALE'
      );
      
      // 1. Criar carrinho
      const cartResponse = await axios.post(`${BASE_URL}/pdv/carts`, {
        storeId: env.store.id,
        customerId: env.customer.id,
      }, {
        headers: this.saasHelper.getHeaders(env.ownerToken, env.organization.id)
      });
      
      const cartId = cartResponse.data.id;
      console.log(`   ✅ Carrinho criado: ${cartId}`);
      
      // 2. Adicionar item ao carrinho
      const itemResponse = await axios.post(`${BASE_URL}/pdv/carts/${cartId}/items`, {
        itemType: 'SERVICE',
        itemName: 'Banho e Tosa',
        itemCode: 'BATH_001',
        description: 'Banho completo e tosa higiênica',
        quantity: 1,
        unitPrice: 80.00,
        discountAmount: 0,
        taxAmount: 0,
      }, {
        headers: this.saasHelper.getHeaders(env.ownerToken, env.organization.id)
      });
      
      console.log(`   ✅ Item adicionado: ${itemResponse.data.id}`);
      
      // 3. Listar itens do carrinho
      const itemsResponse = await axios.get(`${BASE_URL}/pdv/carts/${cartId}/items`, {
        headers: this.saasHelper.getHeaders(env.ownerToken, env.organization.id)
      });
      
      console.log(`   ✅ ${itemsResponse.data.length} item(s) encontrado(s)`);
      
      // 4. Calcular totais
      const totalsResponse = await axios.get(`${BASE_URL}/pdv/carts/${cartId}/totals`, {
        headers: this.saasHelper.getHeaders(env.ownerToken, env.organization.id)
      });
      
      console.log(`   ✅ Total calculado: R$ ${totalsResponse.data.totalAmount}`);
      
      // 5. Processar pagamento
      const paymentResponse = await axios.post(`${BASE_URL}/pdv/carts/${cartId}/payment`, {
        paymentMethod: 'CASH',
        amount: 80.00,
        paymentDetails: {
          cashReceived: 100.00,
          change: 20.00,
        }
      }, {
        headers: this.saasHelper.getHeaders(env.ownerToken, env.organization.id)
      });
      
      console.log(`   ✅ Pagamento processado: ${paymentResponse.data.id}`);
      
      // 6. Gerar cupom fiscal
      const receiptResponse = await axios.post(`${BASE_URL}/pdv/carts/${cartId}/receipt`, {
        receiptType: 'SALES_RECEIPT',
        receiptDetails: {
          customerName: env.customer.name,
          items: ['Banho e Tosa'],
        }
      }, {
        headers: this.saasHelper.getHeaders(env.ownerToken, env.organization.id)
      });
      
      console.log(`   ✅ Cupom fiscal gerado: ${receiptResponse.data.id}`);
      
      this.addResult('Fluxo Completo do PDV', true, 'Todos os passos executados com sucesso');
      
    } catch (error) {
      this.addResult('Fluxo Completo do PDV', false, error.message);
    }
  }

  async testPdvSaasIsolation() {
    console.log('\n4. 🧪 Testando isolamento SaaS do PDV...');
    
    try {
      const org1 = await this.saasHelper.setupCompleteSaasEnvironment();
      const org2 = await this.saasHelper.createSecondOrganization();
      
      // Habilitar feature PDV para ambas as organizações
      await this.saasHelper.enableFeatureForStore(
        org1.ownerToken, 
        org1.store.id, 
        'PDV_POINT_OF_SALE'
      );
      
      await this.saasHelper.enableFeatureForStore(
        org2.ownerToken, 
        org2.store.id, 
        'PDV_POINT_OF_SALE'
      );
      
      // Criar carrinho na Org1
      const cart1Response = await axios.post(`${BASE_URL}/pdv/carts`, {
        storeId: org1.store.id,
        customerId: org1.customer.id,
      }, {
        headers: this.saasHelper.getHeaders(org1.ownerToken, org1.organization.id)
      });
      
      const cart1Id = cart1Response.data.id;
      console.log(`   ✅ Carrinho criado na Org1: ${cart1Id}`);
      
      // Tentar acessar carrinho da Org1 usando token da Org2
      try {
        await axios.get(`${BASE_URL}/pdv/carts/${cart1Id}`, {
          headers: this.saasHelper.getHeaders(org2.ownerToken, org2.organization.id)
        });
        
        this.addResult('Isolamento SaaS do PDV', false, 'Org2 conseguiu acessar carrinho da Org1');
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 404) {
          this.addResult('Isolamento SaaS do PDV', true, 'Isolamento funcionando (403/404)');
        } else {
          this.addResult('Isolamento SaaS do PDV', false, `Resposta inesperada: ${error.response?.status}`);
        }
      }
    } catch (error) {
      this.addResult('Isolamento SaaS do PDV', false, error.message);
    }
  }

  async testPdvFeatureDisabling() {
    console.log('\n5. 🧪 Testando desabilitação da feature PDV...');
    
    try {
      const env = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Habilitar feature PDV
      await this.saasHelper.enableFeatureForStore(
        env.ownerToken, 
        env.store.id, 
        'PDV_POINT_OF_SALE'
      );
      
      // Criar carrinho (deve funcionar)
      const cartResponse = await axios.post(`${BASE_URL}/pdv/carts`, {
        storeId: env.store.id,
        customerId: env.customer.id,
      }, {
        headers: this.saasHelper.getHeaders(env.ownerToken, env.organization.id)
      });
      
      console.log(`   ✅ Carrinho criado com feature habilitada: ${cartResponse.data.id}`);
      
      // Desabilitar feature PDV
      await this.saasHelper.disableFeatureForStore(
        env.ownerToken, 
        env.store.id, 
        'PDV_POINT_OF_SALE'
      );
      
      // Tentar criar novo carrinho (deve falhar)
      try {
        await axios.post(`${BASE_URL}/pdv/carts`, {
          storeId: env.store.id,
          customerId: env.customer.id,
        }, {
          headers: this.saasHelper.getHeaders(env.ownerToken, env.organization.id)
        });
        
        this.addResult('Desabilitação da Feature PDV', false, 'Carrinho foi criado com feature desabilitada');
      } catch (error) {
        if (error.response?.status === 403 && error.response?.data?.message === 'FEATURE_NOT_ENABLED') {
          this.addResult('Desabilitação da Feature PDV', true, 'Feature bloqueou criação após desabilitação (403 FEATURE_NOT_ENABLED)');
        } else {
          this.addResult('Desabilitação da Feature PDV', false, `Resposta inesperada: ${error.response?.status} - ${error.response?.data?.message}`);
        }
      }
    } catch (error) {
      this.addResult('Desabilitação da Feature PDV', false, error.message);
    }
  }

  addResult(testName, passed, message) {
    this.results.tests.push({
      name: testName,
      passed,
      message
    });
    
    if (passed) {
      this.results.passed++;
      console.log(`✅ ${testName}: ${message}`);
    } else {
      this.results.failed++;
      console.log(`❌ ${testName}: ${message}`);
    }
  }

  printResults() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RESULTADOS DOS TESTES DA FEATURE PDV');
    console.log('=' .repeat(60));
    console.log(`✅ Passou: ${this.results.passed}`);
    console.log(`❌ Falhou: ${this.results.failed}`);
    console.log(`📈 Total: ${this.results.passed + this.results.failed}`);
    console.log(`🎯 Taxa de Sucesso: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Testes que falharam:');
      this.results.tests
        .filter(t => !t.passed)
        .forEach(t => console.log(`   - ${t.name}: ${t.message}`));
    }
    
    console.log('=' .repeat(60));
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const pdvTests = new PdvFeatureTests();
  pdvTests.runAllTests();
}

module.exports = PdvFeatureTests;
