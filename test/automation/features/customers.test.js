const axios = require('axios');
const AuthHelper = require('../core/helpers/auth-helper');
const SaasHelper = require('../core/helpers/saas-helper');

const BASE_URL = 'http://localhost:3000';

class CustomersTestSuite {
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
    console.log('👥 INICIANDO TESTES DA FEATURE CUSTOMERS');
    console.log('============================================================');

    try {
      await this.testCustomersManagement();
      await this.testCustomersIsolation();
      await this.testCustomersFeatures();
    } catch (error) {
      console.error('❌ Erro geral nos testes:', error.message);
    }

    this.printResults();
  }

  async testCustomersManagement() {
    console.log('\n1. 🧪 Testando gerenciamento de clientes...');
    try {
      // Configurar ambiente SaaS completo
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Criar cliente
      const customer = await this.createCustomer(environment.ownerToken, environment.organization.id);
      
      // Listar clientes
      const customers = await this.listCustomers(environment.ownerToken, environment.organization.id);
      
      // Obter cliente específico
      const customerDetails = await this.getCustomer(customer.id, environment.ownerToken, environment.organization.id);
      
      // Atualizar cliente
      const updatedCustomer = await this.updateCustomer(customer.id, environment.ownerToken, environment.organization.id);
      
      this.addResult('Gerenciamento de Clientes', true, 'Cliente criado, listado, obtido e atualizado com sucesso');
    } catch (error) {
      this.addResult('Gerenciamento de Clientes', false, error.message);
    }
  }

  async testCustomersIsolation() {
    console.log('\n2. 🧪 Testando isolamento SaaS dos clientes...');
    try {
      // Configurar duas organizações
      const org1 = await this.saasHelper.setupCompleteSaasEnvironment();
      const org2 = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Criar cliente na Org1
      const customer1 = await this.createCustomer(org1.ownerToken, org1.organization.id);
      
      // Tentar acessar cliente da Org1 usando token da Org2
      try {
        await this.getCustomer(customer1.id, org2.ownerToken, org2.organization.id);
        this.addResult('Isolamento SaaS dos Clientes', false, 'Org2 conseguiu acessar cliente da Org1!');
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 404) {
          this.addResult('Isolamento SaaS dos Clientes', true, 'Isolamento funcionando (403/404)');
        } else {
          this.addResult('Isolamento SaaS dos Clientes', false, error.message);
        }
      }
    } catch (error) {
      this.addResult('Isolamento SaaS dos Clientes', false, error.message);
    }
  }

  async testCustomersFeatures() {
    console.log('\n3. 🧪 Testando funcionalidades de clientes...');
    try {
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Criar cliente
      const customer = await this.createCustomer(environment.ownerToken, environment.organization.id);
      
      // Criar pet para o cliente
      const pet = await this.createPet(customer.id, environment.ownerToken, environment.organization.id);
      
      // Listar pets do cliente
      const pets = await this.listCustomerPets(customer.id, environment.ownerToken, environment.organization.id);
      
      // Verificar se o cliente tem pets
      const hasPets = pets && Array.isArray(pets) && pets.length > 0;
      
      if (hasPets) {
        this.addResult('Funcionalidades de Clientes', true, 'Cliente criado e pet associado com sucesso');
      } else {
        this.addResult('Funcionalidades de Clientes', false, 'Pet não foi associado ao cliente');
      }
    } catch (error) {
      this.addResult('Funcionalidades de Clientes', false, error.message);
    }
  }

  async createCustomer(token, orgId) {
    const customerData = {
      firstName: 'João',
      lastName: 'Silva',
      email: `joao.silva.${Date.now()}@test.com`,
      phone: '+5592999999999',
      address: {
        street: 'Rua das Flores',
        number: '123',
        city: 'Manaus',
        state: 'AM',
        zipCode: '69000-000'
      },
      birthDate: '1990-01-01',
      notes: 'Cliente teste'
    };

    const response = await axios.post(`${BASE_URL}/customers`, customerData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Cliente criado: ${response.data.id}`);
    return response.data;
  }

  async listCustomers(token, orgId) {
    const response = await axios.get(`${BASE_URL}/customers`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Clientes listados: ${response.data.length}`);
    return response.data;
  }

  async getCustomer(customerId, token, orgId) {
    const response = await axios.get(`${BASE_URL}/customers/${customerId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Cliente obtido: ${customerId}`);
    return response.data;
  }

  async updateCustomer(customerId, token, orgId) {
    const updateData = {
      firstName: 'João Atualizado',
      lastName: 'Silva Atualizado',
      phone: '+5592888888888',
      notes: 'Cliente atualizado'
    };

    const response = await axios.put(`${BASE_URL}/customers/${customerId}`, updateData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Cliente atualizado: ${customerId}`);
    return response.data;
  }

  async createPet(customerId, token, orgId) {
    const petData = {
      name: 'Rex',
      species: 'DOG',
      breed: 'Golden Retriever',
      birthDate: '2020-01-01',
      gender: 'MALE',
      weight: 25.5,
      color: 'Dourado',
      notes: 'Pet teste'
    };

    const response = await axios.post(`${BASE_URL}/customers/${customerId}/pets`, petData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Pet criado: ${response.data.id}`);
    return response.data;
  }

  async listCustomerPets(customerId, token, orgId) {
    const response = await axios.get(`${BASE_URL}/customers/${customerId}/pets`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Pets do cliente listados: ${response.data.length}`);
    return response.data;
  }

  printResults() {
    console.log('\n============================================================');
    console.log('📊 RESULTADOS DOS TESTES DA FEATURE CUSTOMERS');
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

module.exports = CustomersTestSuite;
