const axios = require('axios');
const AuthHelper = require('../core/helpers/auth-helper');
const SaasHelper = require('../core/helpers/saas-helper');

const BASE_URL = 'http://localhost:3000';

class InventoryTestSuite {
  constructor() {
    this.authHelper = new AuthHelper();
    this.saasHelper = new SaasHelper();
    this.results = [];
  }

  addResult(testName, passed, message) {
    this.results.push({ testName, passed, message });
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${message}`);
  }

  async runAllTests() {
    console.log('📦 INICIANDO TESTES DA FEATURE INVENTORY');
    console.log('============================================================');

    try {
      await this.testInventoryManagement();
      await this.testInventoryIsolation();
      await this.testInventoryFeatures();
    } catch (error) {
      console.error('❌ Erro geral nos testes:', error.message);
    }

    this.printResults();
  }

  async testInventoryManagement() {
    console.log('\n1. 🧪 Testando gerenciamento de inventário...');
    try {
      // Configurar ambiente SaaS completo
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Habilitar feature de inventário
      await this.saasHelper.enableFeature(environment.store.id, 'INVENTORY_MANAGEMENT', environment.ownerToken);
      
      // Criar produto
      const product = await this.createProduct(environment.ownerToken, environment.organization.id, environment.store.id);
      
      // Listar produtos
      const products = await this.listProducts(environment.ownerToken, environment.organization.id, environment.store.id);
      
      // Atualizar produto
      const updatedProduct = await this.updateProduct(product.id, environment.ownerToken, environment.organization.id);
      
      this.addResult('Gerenciamento de Inventário', true, 'Produto criado, listado e atualizado com sucesso');
    } catch (error) {
      this.addResult('Gerenciamento de Inventário', false, error.message);
    }
  }

  async testInventoryIsolation() {
    console.log('\n2. 🧪 Testando isolamento SaaS do inventário...');
    try {
      // Configurar duas organizações
      const org1 = await this.saasHelper.setupCompleteSaasEnvironment();
      const org2 = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Habilitar feature em ambas
      await this.saasHelper.enableFeature(org1.store.id, 'INVENTORY_MANAGEMENT', org1.ownerToken);
      await this.saasHelper.enableFeature(org2.store.id, 'INVENTORY_MANAGEMENT', org2.ownerToken);
      
      // Criar produto na Org1
      const product1 = await this.createProduct(org1.ownerToken, org1.organization.id, org1.store.id);
      
      // Tentar acessar produto da Org1 usando token da Org2
      try {
        await this.getProduct(product1.id, org2.ownerToken, org2.organization.id);
        this.addResult('Isolamento SaaS do Inventário', false, 'Org2 conseguiu acessar produto da Org1!');
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 404) {
          this.addResult('Isolamento SaaS do Inventário', true, 'Isolamento funcionando (403/404)');
        } else {
          this.addResult('Isolamento SaaS do Inventário', false, error.message);
        }
      }
    } catch (error) {
      this.addResult('Isolamento SaaS do Inventário', false, error.message);
    }
  }

  async testInventoryFeatures() {
    console.log('\n3. 🧪 Testando habilitação/desabilitação de features...');
    try {
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Tentar criar produto sem feature habilitada
      try {
        await this.createProduct(environment.ownerToken, environment.organization.id, environment.store.id);
        this.addResult('Habilitação/Desabilitação de Features', false, 'Produto criado sem feature habilitada!');
      } catch (error) {
        if (error.response?.status === 403) {
          // Habilitar feature
          await this.saasHelper.enableFeature(environment.store.id, 'INVENTORY_MANAGEMENT', environment.ownerToken);
          
          // Criar produto com feature habilitada
          const product = await this.createProduct(environment.ownerToken, environment.organization.id, environment.store.id);
          
          // Desabilitar feature
          await this.saasHelper.disableFeature(environment.store.id, 'INVENTORY_MANAGEMENT', environment.ownerToken);
          
          // Tentar criar outro produto
          try {
            await this.createProduct(environment.ownerToken, environment.organization.id, environment.store.id);
            this.addResult('Habilitação/Desabilitação de Features', false, 'Produto criado após desabilitação!');
          } catch (error) {
            if (error.response?.status === 403) {
              this.addResult('Habilitação/Desabilitação de Features', true, 'Feature bloqueou criação após desabilitação (403 FEATURE_NOT_ENABLED)');
            } else {
              this.addResult('Habilitação/Desabilitação de Features', false, error.message);
            }
          }
        } else {
          this.addResult('Habilitação/Desabilitação de Features', false, error.message);
        }
      }
    } catch (error) {
      this.addResult('Habilitação/Desabilitação de Features', false, error.message);
    }
  }

  async createProduct(token, orgId, storeId) {
    const productData = {
      code: `PROD_${Date.now()}`,
      name: 'Produto Teste',
      description: 'Produto para teste',
      category: 'OTHER',
      unit: 'UNIT',
      costPriceCents: 3000, // 30.00 em centavos
      salePriceCents: 5000, // 50.00 em centavos
      minStock: 10,
      active: true,
    };

    const response = await axios.post(`${BASE_URL}/products`, productData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Produto criado: ${response.data.id}`);
    return response.data;
  }

  async listProducts(token, orgId, storeId) {
    const response = await axios.get(`${BASE_URL}/products`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      },
      params: { storeId }
    });

    console.log(`✅ Produtos listados: ${response.data.length}`);
    return response.data;
  }

  async updateProduct(productId, token, orgId) {
    const updateData = {
      name: 'Produto Atualizado',
      price: 60.00,
    };

    const response = await axios.put(`${BASE_URL}/products/${productId}`, updateData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Produto atualizado: ${response.data.id}`);
    return response.data;
  }

  async getProduct(productId, token, orgId) {
    const response = await axios.get(`${BASE_URL}/products/${productId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    return response.data;
  }

  printResults() {
    console.log('\n============================================================');
    console.log('📊 RESULTADOS DOS TESTES DA FEATURE INVENTORY');
    console.log('============================================================');
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    const successRate = ((passed / total) * 100).toFixed(1);
    
    console.log(`✅ Passou: ${passed}`);
    console.log(`❌ Falhou: ${failed}`);
    console.log(`📈 Total: ${total}`);
    console.log(`🎯 Taxa de Sucesso: ${successRate}%`);
    
    if (failed > 0) {
      console.log('\n❌ Testes que falharam:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`   - ${result.testName}: ${result.message}`);
      });
    }
    
    console.log('============================================================');
  }
}

// Executar testes
const inventoryTests = new InventoryTestSuite();
inventoryTests.runAllTests();

module.exports = InventoryTestSuite;
