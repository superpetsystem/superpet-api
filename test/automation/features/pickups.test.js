const axios = require('axios');
const AuthHelper = require('../core/helpers/auth-helper');
const SaasHelper = require('../core/helpers/saas-helper');

const BASE_URL = 'http://localhost:3000';

class PickupsTestSuite {
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
    console.log('🚚 INICIANDO TESTES DA FEATURE PICKUPS');
    console.log('============================================================');

    try {
      await this.testPickupsManagement();
      await this.testPickupsIsolation();
      await this.testPickupsFeatures();
    } catch (error) {
      console.error('❌ Erro geral nos testes:', error.message);
    }

    this.printResults();
  }

  async testPickupsManagement() {
    console.log('\n1. 🧪 Testando gerenciamento de pickups...');
    try {
      // Configurar ambiente SaaS completo
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Criar pickup
      const pickup = await this.createPickup(environment.ownerToken, environment.organization.id, environment.store.id, environment.customer.id);
      
      // Listar pickups da loja
      const pickups = await this.listStorePickups(environment.ownerToken, environment.organization.id, environment.store.id);
      
      // Atualizar status do pickup
      const updatedPickup = await this.updatePickupStatus(pickup.id, environment.ownerToken, environment.organization.id, environment.store.id, 'IN_PROGRESS');
      
      this.addResult('Gerenciamento de Pickups', true, 'Pickup criado, listado e atualizado com sucesso');
    } catch (error) {
      this.addResult('Gerenciamento de Pickups', false, error.message);
    }
  }

  async testPickupsIsolation() {
    console.log('\n2. 🧪 Testando isolamento SaaS dos pickups...');
    try {
      // Configurar duas organizações
      const org1 = await this.saasHelper.setupCompleteSaasEnvironment();
      const org2 = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Criar pickup na Org1
      const pickup1 = await this.createPickup(org1.ownerToken, org1.organization.id, org1.store.id, org1.customer.id);
      
      // Tentar acessar pickup da Org1 usando token da Org2
      try {
        await this.getPickup(pickup1.id, org2.ownerToken, org2.organization.id, org2.store.id);
        this.addResult('Isolamento SaaS dos Pickups', false, 'Org2 conseguiu acessar pickup da Org1!');
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 404) {
          this.addResult('Isolamento SaaS dos Pickups', true, 'Isolamento funcionando (403/404)');
        } else {
          this.addResult('Isolamento SaaS dos Pickups', false, error.message);
        }
      }
    } catch (error) {
      this.addResult('Isolamento SaaS dos Pickups', false, error.message);
    }
  }

  async testPickupsFeatures() {
    console.log('\n3. 🧪 Testando funcionalidades de pickups...');
    try {
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Criar pickup
      const pickup = await this.createPickup(environment.ownerToken, environment.organization.id, environment.store.id, environment.customer.id);
      
      // Testar diferentes status
      await this.updatePickupStatus(pickup.id, environment.ownerToken, environment.organization.id, environment.store.id, 'IN_PROGRESS');
      await this.updatePickupStatus(pickup.id, environment.ownerToken, environment.organization.id, environment.store.id, 'COMPLETED');
      
      // Listar pickups para verificar se o status foi atualizado
      const pickups = await this.listStorePickups(environment.ownerToken, environment.organization.id, environment.store.id);
      
      const completedPickup = pickups.find(p => p.id === pickup.id && p.status === 'COMPLETED');
      
      if (completedPickup) {
        this.addResult('Funcionalidades de Pickups', true, 'Status do pickup atualizado com sucesso');
      } else {
        this.addResult('Funcionalidades de Pickups', false, 'Status do pickup não foi atualizado corretamente');
      }
    } catch (error) {
      this.addResult('Funcionalidades de Pickups', false, error.message);
    }
  }

  async createPickup(token, orgId, storeId, customerId) {
    const pickupData = {
      customerId: customerId,
      pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Amanhã
      pickupTime: '10:00',
      address: 'Rua Teste, 123',
      city: 'Manaus',
      state: 'AM',
      zipCode: '69000-000',
      phone: '+5592999999999',
      notes: 'Pickup de teste',
      status: 'SCHEDULED',
    };

    const response = await axios.post(`${BASE_URL}/stores/${storeId}/pickups`, pickupData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Pickup criado: ${response.data.id}`);
    return response.data;
  }

  async listStorePickups(token, orgId, storeId) {
    const response = await axios.get(`${BASE_URL}/stores/${storeId}/pickups`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Pickups listados: ${response.data.length}`);
    return response.data;
  }

  async getPickup(pickupId, token, orgId, storeId) {
    const response = await axios.get(`${BASE_URL}/stores/${storeId}/pickups/${pickupId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    return response.data;
  }

  async updatePickupStatus(pickupId, token, orgId, storeId, status) {
    const updateData = {
      status: status,
    };

    const response = await axios.patch(`${BASE_URL}/stores/${storeId}/pickups/${pickupId}/status`, updateData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Status do pickup atualizado: ${pickupId} -> ${status}`);
    return response.data;
  }

  printResults() {
    console.log('\n============================================================');
    console.log('📊 RESULTADOS DOS TESTES DA FEATURE PICKUPS');
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

module.exports = PickupsTestSuite;
