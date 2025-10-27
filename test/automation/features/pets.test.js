const axios = require('axios');
const AuthHelper = require('../core/helpers/auth-helper');
const SaasHelper = require('../core/helpers/saas-helper');

const BASE_URL = 'http://localhost:3000';

class PetsTestSuite {
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
    console.log('🐕 INICIANDO TESTES DA FEATURE PETS');
    console.log('============================================================');

    try {
      await this.testPetsManagement();
      await this.testPetsIsolation();
      await this.testPetsFeatures();
    } catch (error) {
      console.error('❌ Erro geral nos testes:', error.message);
    }

    this.printResults();
  }

  async testPetsManagement() {
    console.log('\n1. 🧪 Testando gerenciamento de pets...');
    try {
      // Configurar ambiente SaaS completo
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Criar pet
      const pet = await this.createPet(environment.customer.id, environment.ownerToken, environment.organization.id);
      
      // Listar pets do cliente
      const pets = await this.listCustomerPets(environment.customer.id, environment.ownerToken, environment.organization.id);
      
      // Obter pet específico
      const petDetails = await this.getPet(pet.id, environment.ownerToken, environment.organization.id);
      
      // Atualizar pet
      const updatedPet = await this.updatePet(pet.id, environment.ownerToken, environment.organization.id);
      
      this.addResult('Gerenciamento de Pets', true, 'Pet criado, listado, obtido e atualizado com sucesso');
    } catch (error) {
      this.addResult('Gerenciamento de Pets', false, error.message);
    }
  }

  async testPetsIsolation() {
    console.log('\n2. 🧪 Testando isolamento SaaS dos pets...');
    try {
      // Configurar duas organizações
      const org1 = await this.saasHelper.setupCompleteSaasEnvironment();
      const org2 = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Criar pet na Org1
      const pet1 = await this.createPet(org1.customer.id, org1.ownerToken, org1.organization.id);
      
      // Tentar acessar pet da Org1 usando token da Org2
      try {
        await this.getPet(pet1.id, org2.ownerToken, org2.organization.id);
        this.addResult('Isolamento SaaS dos Pets', false, 'Org2 conseguiu acessar pet da Org1!');
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 404) {
          this.addResult('Isolamento SaaS dos Pets', true, 'Isolamento funcionando (403/404)');
        } else {
          this.addResult('Isolamento SaaS dos Pets', false, error.message);
        }
      }
    } catch (error) {
      this.addResult('Isolamento SaaS dos Pets', false, error.message);
    }
  }

  async testPetsFeatures() {
    console.log('\n3. 🧪 Testando funcionalidades de pets...');
    try {
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Criar pet
      const pet = await this.createPet(environment.customer.id, environment.ownerToken, environment.organization.id);
      
      // Listar todos os pets da organização
      const allPets = await this.listAllPets(environment.ownerToken, environment.organization.id);
      
      // Buscar pets por espécie
      const dogs = await this.searchPetsBySpecies('DOG', environment.ownerToken, environment.organization.id);
      
      // Verificar se as funcionalidades retornaram dados válidos
      const hasAllPets = allPets && Array.isArray(allPets);
      const hasDogs = dogs && Array.isArray(dogs);
      
      if (hasAllPets && hasDogs) {
        this.addResult('Funcionalidades de Pets', true, 'Pets listados e filtrados com sucesso');
      } else {
        this.addResult('Funcionalidades de Pets', false, 'Funcionalidades não retornaram dados válidos');
      }
    } catch (error) {
      this.addResult('Funcionalidades de Pets', false, error.message);
    }
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

  async getPet(petId, token, orgId) {
    const response = await axios.get(`${BASE_URL}/pets/${petId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Pet obtido: ${petId}`);
    return response.data;
  }

  async updatePet(petId, token, orgId) {
    const updateData = {
      name: 'Rex Atualizado',
      weight: 30.0,
      notes: 'Pet atualizado'
    };

    const response = await axios.put(`${BASE_URL}/pets/${petId}`, updateData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Pet atualizado: ${petId}`);
    return response.data;
  }

  async listAllPets(token, orgId) {
    const response = await axios.get(`${BASE_URL}/pets`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Todos os pets listados: ${response.data.length}`);
    return response.data;
  }

  async searchPetsBySpecies(species, token, orgId) {
    const response = await axios.get(`${BASE_URL}/pets?species=${species}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Pets por espécie listados: ${response.data.length}`);
    return response.data;
  }

  printResults() {
    console.log('\n============================================================');
    console.log('📊 RESULTADOS DOS TESTES DA FEATURE PETS');
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

module.exports = PetsTestSuite;
