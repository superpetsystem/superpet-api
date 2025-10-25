const axios = require('axios');
const AuthHelper = require('../core/helpers/auth-helper');
const SaasHelper = require('../core/helpers/saas-helper');

const BASE_URL = 'http://localhost:3000';

class VeterinaryTestSuite {
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
    console.log('🏥 INICIANDO TESTES DA FEATURE VETERINARY');
    console.log('============================================================');

    try {
      await this.testVeterinaryManagement();
      await this.testVeterinaryIsolation();
      await this.testVeterinaryFeatures();
    } catch (error) {
      console.error('❌ Erro geral nos testes:', error.message);
    }

    this.printResults();
  }

  async testVeterinaryManagement() {
    console.log('\n1. 🧪 Testando gerenciamento veterinário...');
    try {
      // Configurar ambiente SaaS completo
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Criar pet para o customer
      const pet = await this.createPet(environment.ownerToken, environment.organization.id, environment.customer.id);
      
      // Criar registro veterinário
      const record = await this.createVeterinaryRecord(environment.ownerToken, environment.organization.id, pet.id);
      
      // Listar registros do pet
      const records = await this.listPetRecords(environment.ownerToken, environment.organization.id, pet.id);
      
      // Atualizar registro
      const updatedRecord = await this.updateVeterinaryRecord(record.id, environment.ownerToken, environment.organization.id);
      
      this.addResult('Gerenciamento Veterinário', true, 'Registro criado, listado e atualizado com sucesso');
    } catch (error) {
      this.addResult('Gerenciamento Veterinário', false, error.message);
    }
  }

  async testVeterinaryIsolation() {
    console.log('\n2. 🧪 Testando isolamento SaaS do veterinário...');
    try {
      // Configurar duas organizações
      const org1 = await this.saasHelper.setupCompleteSaasEnvironment();
      const org2 = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Criar pets para ambas as organizações
      const pet1 = await this.createPet(org1.ownerToken, org1.organization.id, org1.customer.id);
      const pet2 = await this.createPet(org2.ownerToken, org2.organization.id, org2.customer.id);
      
      // Criar registro na Org1
      const record1 = await this.createVeterinaryRecord(org1.ownerToken, org1.organization.id, pet1.id);
      
      // Tentar acessar registro da Org1 usando token da Org2
      try {
        await this.getVeterinaryRecord(record1.id, org2.ownerToken, org2.organization.id);
        this.addResult('Isolamento SaaS do Veterinário', false, 'Org2 conseguiu acessar registro da Org1!');
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 404) {
          this.addResult('Isolamento SaaS do Veterinário', true, 'Isolamento funcionando (403/404)');
        } else {
          this.addResult('Isolamento SaaS do Veterinário', false, error.message);
        }
      }
    } catch (error) {
      this.addResult('Isolamento SaaS do Veterinário', false, error.message);
    }
  }

  async testVeterinaryFeatures() {
    console.log('\n3. 🧪 Testando funcionalidades veterinárias...');
    try {
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Criar pet
      const pet = await this.createPet(environment.ownerToken, environment.organization.id, environment.customer.id);
      
      // Criar registro veterinário
      const record = await this.createVeterinaryRecord(environment.ownerToken, environment.organization.id, pet.id);
      
      // Criar vacinação
      const vaccination = await this.createVaccination(environment.ownerToken, environment.organization.id, pet.id);
      
      // Listar vacinações do pet
      const vaccinations = await this.listPetVaccinations(environment.ownerToken, environment.organization.id, pet.id);
      
      // Listar vacinações próximas
      const upcomingVaccinations = await this.getUpcomingVaccinations(environment.ownerToken, environment.organization.id, pet.id);
      
      this.addResult('Funcionalidades Veterinárias', true, 'Registros e vacinações criados e listados com sucesso');
    } catch (error) {
      this.addResult('Funcionalidades Veterinárias', false, error.message);
    }
  }

  async createPet(token, orgId, customerId) {
    const petData = {
      name: 'Pet Teste',
      species: 'DOG',
      breed: 'Golden Retriever',
      birthDate: '2020-01-01',
      gender: 'MALE',
      weight: 25.5,
      color: 'Dourado',
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

  async createVeterinaryRecord(token, orgId, petId) {
    const recordData = {
      petId: petId,
      type: 'CONSULTATION',
      date: new Date().toISOString().split('T')[0],
      description: 'Consulta de rotina',
      diagnosis: 'Pet saudável',
      treatment: 'Nenhum tratamento necessário',
      weight: 25.5,
      temperature: 38.5,
      notes: 'Pet em bom estado geral',
    };

    const response = await axios.post(`${BASE_URL}/veterinary/records`, recordData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Registro veterinário criado: ${response.data.id}`);
    return response.data;
  }

  async createVaccination(token, orgId, petId) {
    const vaccinationData = {
      petId: petId,
      vaccineName: 'Vacina V8',
      date: new Date().toISOString().split('T')[0],
      nextDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 ano
      veterinarian: 'Dr. Teste',
      batchNumber: 'BATCH123',
      notes: 'Vacinação de rotina',
    };

    const response = await axios.post(`${BASE_URL}/veterinary/vaccinations`, vaccinationData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Vacinação criada: ${response.data.id}`);
    return response.data;
  }

  async listPetRecords(token, orgId, petId) {
    const response = await axios.get(`${BASE_URL}/veterinary/pets/${petId}/records`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Registros listados: ${response.data.length}`);
    return response.data;
  }

  async listPetVaccinations(token, orgId, petId) {
    const response = await axios.get(`${BASE_URL}/veterinary/pets/${petId}/vaccinations`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Vacinações listadas: ${response.data.length}`);
    return response.data;
  }

  async getUpcomingVaccinations(token, orgId, petId) {
    const response = await axios.get(`${BASE_URL}/veterinary/pets/${petId}/vaccinations/upcoming`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Vacinações próximas: ${response.data.length}`);
    return response.data;
  }

  async getVeterinaryRecord(recordId, token, orgId) {
    const response = await axios.get(`${BASE_URL}/veterinary/records/${recordId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    return response.data;
  }

  async updateVeterinaryRecord(recordId, token, orgId) {
    const updateData = {
      description: 'Consulta atualizada',
      notes: 'Notas atualizadas',
    };

    const response = await axios.put(`${BASE_URL}/veterinary/records/${recordId}`, updateData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Registro atualizado: ${recordId}`);
    return response.data;
  }

  printResults() {
    console.log('\n============================================================');
    console.log('📊 RESULTADOS DOS TESTES DA FEATURE VETERINARY');
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

module.exports = VeterinaryTestSuite;
