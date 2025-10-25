const axios = require('axios');
const AuthHelper = require('../core/helpers/auth-helper');
const SaasHelper = require('../core/helpers/saas-helper');

const BASE_URL = 'http://localhost:3000';

class StoresTestSuite {
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
    console.log('🏪 INICIANDO TESTES DA FEATURE STORES');
    console.log('============================================================');

    try {
      await this.testStoresManagement();
      await this.testStoresIsolation();
      await this.testStoresFeatures();
    } catch (error) {
      console.error('❌ Erro geral nos testes:', error.message);
    }

    this.printResults();
  }

  async testStoresManagement() {
    console.log('\n1. 🧪 Testando gerenciamento de lojas...');
    try {
      // Configurar ambiente SaaS completo
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Listar lojas da organização
      const stores = await this.listStores(environment.ownerToken, environment.organization.id);
      
      // Obter detalhes de uma loja
      const storeDetails = await this.getStore(environment.store.id, environment.ownerToken, environment.organization.id);
      
      // Atualizar loja
      const updatedStore = await this.updateStore(environment.store.id, environment.ownerToken, environment.organization.id);
      
      this.addResult('Gerenciamento de Lojas', true, 'Lojas listadas, obtidas e atualizadas com sucesso');
    } catch (error) {
      this.addResult('Gerenciamento de Lojas', false, error.message);
    }
  }

  async testStoresIsolation() {
    console.log('\n2. 🧪 Testando isolamento SaaS das lojas...');
    try {
      // Configurar duas organizações
      const org1 = await this.saasHelper.setupCompleteSaasEnvironment();
      const org2 = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Tentar acessar loja da Org1 usando token da Org2
      try {
        await this.getStore(org1.store.id, org2.ownerToken, org2.organization.id);
        this.addResult('Isolamento SaaS das Lojas', false, 'Org2 conseguiu acessar loja da Org1!');
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 404) {
          this.addResult('Isolamento SaaS das Lojas', true, 'Isolamento funcionando (403/404)');
        } else {
          this.addResult('Isolamento SaaS das Lojas', false, error.message);
        }
      }
    } catch (error) {
      this.addResult('Isolamento SaaS das Lojas', false, error.message);
    }
  }

  async testStoresFeatures() {
    console.log('\n3. 🧪 Testando funcionalidades de lojas...');
    try {
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Testar diferentes funcionalidades de loja
      const stores = await this.listStores(environment.ownerToken, environment.organization.id);
      const storeDetails = await this.getStore(environment.store.id, environment.ownerToken, environment.organization.id);
      
      // Verificar se as lojas contêm dados esperados
      const hasStores = stores && Array.isArray(stores) && stores.length > 0;
      const hasStoreDetails = storeDetails && typeof storeDetails === 'object' && storeDetails.id;
      
      if (hasStores && hasStoreDetails) {
        this.addResult('Funcionalidades de Lojas', true, 'Lojas retornaram dados válidos');
      } else {
        this.addResult('Funcionalidades de Lojas', false, 'Lojas não retornaram dados válidos');
      }
    } catch (error) {
      this.addResult('Funcionalidades de Lojas', false, error.message);
    }
  }

  async listStores(token, orgId) {
    const response = await axios.get(`${BASE_URL}/admin/organizations/${orgId}/stores`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Lojas listadas: ${response.data.length}`);
    return response.data;
  }

  async getStore(storeId, token, orgId) {
    const response = await axios.get(`${BASE_URL}/stores/${storeId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Loja obtida: ${storeId}`);
    return response.data;
  }

  async updateStore(storeId, token, orgId) {
    const updateData = {
      name: 'Loja Atualizada',
      description: 'Descrição atualizada da loja',
      phone: '+5592999999999',
      email: 'loja@teste.com',
      address: {
        street: 'Rua Atualizada',
        number: '123',
        city: 'Manaus',
        state: 'AM',
        zipCode: '69000-000'
      },
      openingHours: {
        mon: [['08:00', '18:00']],
        tue: [['08:00', '18:00']],
        wed: [['08:00', '18:00']],
        thu: [['08:00', '18:00']],
        fri: [['08:00', '18:00']],
        sat: [['08:00', '16:00']],
        sun: [['09:00', '15:00']]
      },
      resourcesCatalog: ['grooming', 'veterinary', 'training'],
      capacity: {
        grooming: 50,
        veterinary: 30,
        training: 20
      }
    };

    const response = await axios.put(`${BASE_URL}/stores/${storeId}`, updateData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Loja atualizada: ${storeId}`);
    return response.data;
  }

  printResults() {
    console.log('\n============================================================');
    console.log('📊 RESULTADOS DOS TESTES DA FEATURE STORES');
    console.log('============================================================');
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    
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

module.exports = StoresTestSuite;
