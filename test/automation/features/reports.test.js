const axios = require('axios');
const AuthHelper = require('../core/helpers/auth-helper');
const SaasHelper = require('../core/helpers/saas-helper');

const BASE_URL = 'http://localhost:3000';

class ReportsTestSuite {
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
    console.log('📊 INICIANDO TESTES DA FEATURE REPORTS');
    console.log('============================================================');

    try {
      await this.testReportsManagement();
      await this.testReportsIsolation();
      await this.testReportsFeatures();
    } catch (error) {
      console.error('❌ Erro geral nos testes:', error.message);
    }

    this.printResults();
  }

  async testReportsManagement() {
    console.log('\n1. 🧪 Testando gerenciamento de relatórios...');
    try {
      // Configurar ambiente SaaS completo
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Obter dashboard
      const dashboard = await this.getDashboard(environment.ownerToken, environment.organization.id);
      
      // Obter relatório de clientes
      const customersReport = await this.getCustomersReport(environment.ownerToken, environment.organization.id);
      
      // Obter relatório de pets
      const petsReport = await this.getPetsReport(environment.ownerToken, environment.organization.id);
      
      // Obter relatório de performance da loja
      const storePerformance = await this.getStorePerformance(environment.ownerToken, environment.organization.id, environment.store.id);
      
      this.addResult('Gerenciamento de Relatórios', true, 'Relatórios obtidos com sucesso');
    } catch (error) {
      this.addResult('Gerenciamento de Relatórios', false, error.message);
    }
  }

  async testReportsIsolation() {
    console.log('\n2. 🧪 Testando isolamento SaaS dos relatórios...');
    try {
      // Configurar duas organizações
      const org1 = await this.saasHelper.setupCompleteSaasEnvironment();
      const org2 = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Obter dashboard da Org1
      const dashboard1 = await this.getDashboard(org1.ownerToken, org1.organization.id);
      
      // Tentar acessar dashboard da Org1 usando token da Org2
      try {
        await this.getDashboard(org2.ownerToken, org1.organization.id);
        this.addResult('Isolamento SaaS dos Relatórios', false, 'Org2 conseguiu acessar dados da Org1!');
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 404) {
          this.addResult('Isolamento SaaS dos Relatórios', true, 'Isolamento funcionando (403/404)');
        } else {
          this.addResult('Isolamento SaaS dos Relatórios', false, error.message);
        }
      }
    } catch (error) {
      this.addResult('Isolamento SaaS dos Relatórios', false, error.message);
    }
  }

  async testReportsFeatures() {
    console.log('\n3. 🧪 Testando funcionalidades de relatórios...');
    try {
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Criar alguns dados para os relatórios
      const pet = await this.createPet(environment.ownerToken, environment.organization.id, environment.customer.id);
      
      // Testar diferentes tipos de relatórios
      const dashboard = await this.getDashboard(environment.ownerToken, environment.organization.id);
      const customersReport = await this.getCustomersReport(environment.ownerToken, environment.organization.id);
      const petsReport = await this.getPetsReport(environment.ownerToken, environment.organization.id);
      const storePerformance = await this.getStorePerformance(environment.ownerToken, environment.organization.id, environment.store.id);
      
      // Verificar se os relatórios contêm dados esperados
      const hasDashboardData = dashboard && typeof dashboard === 'object';
      const hasCustomersData = customersReport && Array.isArray(customersReport);
      const hasPetsData = petsReport && Array.isArray(petsReport);
      const hasPerformanceData = storePerformance && typeof storePerformance === 'object';
      
      if (hasDashboardData && hasCustomersData && hasPetsData && hasPerformanceData) {
        this.addResult('Funcionalidades de Relatórios', true, 'Todos os relatórios retornaram dados válidos');
      } else {
        this.addResult('Funcionalidades de Relatórios', false, 'Alguns relatórios não retornaram dados válidos');
      }
    } catch (error) {
      this.addResult('Funcionalidades de Relatórios', false, error.message);
    }
  }

  async createPet(token, orgId, customerId) {
    const petData = {
      name: 'Pet Relatório',
      species: 'DOG',
      breed: 'Labrador',
      birthDate: '2020-01-01',
      gender: 'FEMALE',
      weight: 20.0,
      color: 'Preto',
    };

    const response = await axios.post(`${BASE_URL}/customers/${customerId}/pets`, petData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Pet criado para relatório: ${response.data.id}`);
    return response.data;
  }

  async getDashboard(token, orgId) {
    const response = await axios.get(`${BASE_URL}/reports/dashboard`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Dashboard obtido`);
    return response.data;
  }

  async getCustomersReport(token, orgId) {
    const response = await axios.get(`${BASE_URL}/reports/customers`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Relatório de clientes obtido`);
    return response.data;
  }

  async getPetsReport(token, orgId) {
    const response = await axios.get(`${BASE_URL}/reports/pets`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Relatório de pets obtido`);
    return response.data;
  }

  async getStorePerformance(token, orgId, storeId) {
    const response = await axios.get(`${BASE_URL}/reports/stores/${storeId}/performance`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Performance da loja obtida`);
    return response.data;
  }

  printResults() {
    console.log('\n============================================================');
    console.log('📊 RESULTADOS DOS TESTES DA FEATURE REPORTS');
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

module.exports = ReportsTestSuite;
