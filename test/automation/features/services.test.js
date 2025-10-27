const axios = require('axios');
const AuthHelper = require('../core/helpers/auth-helper');
const SaasHelper = require('../core/helpers/saas-helper');

const BASE_URL = 'http://localhost:3000';

class ServicesTestSuite {
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
    console.log('🛠️ INICIANDO TESTES DA FEATURE SERVICES');
    console.log('============================================================');

    try {
      await this.testServicesManagement();
      await this.testServicesIsolation();
      await this.testServicesFeatures();
    } catch (error) {
      console.error('❌ Erro geral nos testes:', error.message);
    }

    this.printResults();
  }

  async testServicesManagement() {
    console.log('\n1. 🧪 Testando gerenciamento de serviços...');
    try {
      // Configurar ambiente SaaS completo
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Habilitar feature de serviços
      await this.saasHelper.enableFeature(environment.store.id, 'SERVICE_CATALOG', environment.ownerToken);
      
      // Criar serviço
      const service = await this.createService(environment.ownerToken, environment.organization.id, environment.store.id);
      
      // Listar serviços
      const services = await this.listServices(environment.ownerToken, environment.organization.id, environment.store.id);
      
      // Atualizar serviço
      const updatedService = await this.updateService(service.id, environment.ownerToken, environment.organization.id, environment.store.id);
      
      // Deletar serviço
      await this.deleteService(service.id, environment.ownerToken, environment.organization.id, environment.store.id);
      
      this.addResult('Gerenciamento de Serviços', true, 'Serviço criado, listado, atualizado e deletado com sucesso');
    } catch (error) {
      this.addResult('Gerenciamento de Serviços', false, error.message);
    }
  }

  async testServicesIsolation() {
    console.log('\n2. 🧪 Testando isolamento SaaS dos serviços...');
    try {
      // Configurar duas organizações
      const org1 = await this.saasHelper.setupCompleteSaasEnvironment();
      const org2 = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Habilitar feature em ambas
      await this.saasHelper.enableFeature(org1.store.id, 'SERVICE_CATALOG', org1.ownerToken);
      await this.saasHelper.enableFeature(org2.store.id, 'SERVICE_CATALOG', org2.ownerToken);
      
      // Criar serviço na Org1
      const service1 = await this.createService(org1.ownerToken, org1.organization.id, org1.store.id);
      
      // Tentar acessar serviço da Org1 usando token da Org2
      try {
        await this.getService(service1.id, org2.ownerToken, org2.organization.id, org2.store.id);
        this.addResult('Isolamento SaaS dos Serviços', false, 'Org2 conseguiu acessar serviço da Org1!');
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 404) {
          this.addResult('Isolamento SaaS dos Serviços', true, 'Isolamento funcionando (403/404)');
        } else {
          this.addResult('Isolamento SaaS dos Serviços', false, error.message);
        }
      }
    } catch (error) {
      this.addResult('Isolamento SaaS dos Serviços', false, error.message);
    }
  }

  async testServicesFeatures() {
    console.log('\n3. 🧪 Testando funcionalidades de serviços...');
    try {
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Tentar criar serviço sem feature habilitada
      try {
        await this.createService(environment.ownerToken, environment.organization.id, environment.store.id);
        this.addResult('Funcionalidades de Serviços', false, 'Serviço criado sem feature habilitada!');
      } catch (error) {
        if (error.response?.status === 403) {
          // Habilitar feature
          await this.saasHelper.enableFeature(environment.store.id, 'SERVICE_CATALOG', environment.ownerToken);
          
          // Criar serviço com feature habilitada
          const service = await this.createService(environment.ownerToken, environment.organization.id, environment.store.id);
          
          // Publicar serviço
          await this.publishService(service.id, environment.ownerToken, environment.organization.id, environment.store.id);
          
          // Arquivar serviço
          await this.archiveService(service.id, environment.ownerToken, environment.organization.id, environment.store.id);
          
          this.addResult('Funcionalidades de Serviços', true, 'Serviço criado, publicado e arquivado com sucesso');
        } else {
          this.addResult('Funcionalidades de Serviços', false, error.message);
        }
      }
    } catch (error) {
      this.addResult('Funcionalidades de Serviços', false, error.message);
    }
  }

  async createService(token, orgId, storeId) {
    const serviceData = {
      name: 'Banho e Tosa',
      description: 'Serviço completo de banho e tosa para pets',
      price: 80.00,
      duration: 120, // minutos
      category: 'GROOMING',
      isActive: true,
    };

    const response = await axios.post(`${BASE_URL}/stores/${storeId}/custom-services`, serviceData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Serviço criado: ${response.data.id}`);
    return response.data;
  }

  async listServices(token, orgId, storeId) {
    const response = await axios.get(`${BASE_URL}/stores/${storeId}/custom-services`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Serviços listados: ${response.data.length}`);
    return response.data;
  }

  async getService(serviceId, token, orgId, storeId) {
    const response = await axios.get(`${BASE_URL}/stores/${storeId}/custom-services/${serviceId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    return response.data;
  }

  async updateService(serviceId, token, orgId, storeId) {
    const updateData = {
      name: 'Banho e Tosa Premium',
      description: 'Serviço premium de banho e tosa',
      price: 100.00,
    };

    const response = await axios.put(`${BASE_URL}/stores/${storeId}/custom-services/${serviceId}`, updateData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Serviço atualizado: ${serviceId}`);
    return response.data;
  }

  async publishService(serviceId, token, orgId, storeId) {
    const response = await axios.post(`${BASE_URL}/stores/${storeId}/custom-services/${serviceId}/publish`, {}, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Serviço publicado: ${serviceId}`);
    return response.data;
  }

  async archiveService(serviceId, token, orgId, storeId) {
    const response = await axios.post(`${BASE_URL}/stores/${storeId}/custom-services/${serviceId}/archive`, {}, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Serviço arquivado: ${serviceId}`);
    return response.data;
  }

  async deleteService(serviceId, token, orgId, storeId) {
    await axios.delete(`${BASE_URL}/stores/${storeId}/custom-services/${serviceId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Serviço deletado: ${serviceId}`);
  }

  printResults() {
    console.log('\n============================================================');
    console.log('📊 RESULTADOS DOS TESTES DA FEATURE SERVICES');
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

module.exports = ServicesTestSuite;
