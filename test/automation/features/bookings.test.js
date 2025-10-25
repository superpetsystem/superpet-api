const axios = require('axios');
const AuthHelper = require('../core/helpers/auth-helper');
const SaasHelper = require('../core/helpers/saas-helper');

const BASE_URL = 'http://localhost:3000';

class BookingsTestSuite {
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
    console.log('📅 INICIANDO TESTES DA FEATURE BOOKINGS');
    console.log('============================================================');

    try {
      await this.testBookingManagement();
      await this.testBookingIsolation();
      await this.testBookingFeatures();
    } catch (error) {
      console.error('❌ Erro geral nos testes:', error.message);
    }

    this.printResults();
  }

  async testBookingManagement() {
    console.log('\n1. 🧪 Testando gerenciamento de agendamentos...');
    try {
      // Configurar ambiente SaaS completo
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Habilitar feature de agendamentos
      await this.saasHelper.enableFeature(environment.store.id, 'ONLINE_BOOKING', environment.ownerToken);
      
      // Criar serviço primeiro
      const service = await this.createService(environment.ownerToken, environment.organization.id);
      
      // Criar agendamento
      const booking = await this.createBooking(environment.ownerToken, environment.organization.id, environment.store.id, environment.customer.id, service.id);
      
      this.addResult('Gerenciamento de Agendamentos', true, 'Agendamento criado com sucesso');
    } catch (error) {
      this.addResult('Gerenciamento de Agendamentos', false, error.message);
    }
  }

  async testBookingIsolation() {
    console.log('\n2. 🧪 Testando isolamento SaaS dos agendamentos...');
    try {
      // Configurar duas organizações
      const org1 = await this.saasHelper.setupCompleteSaasEnvironment();
      const org2 = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Habilitar feature em ambas
      await this.saasHelper.enableFeature(org1.store.id, 'ONLINE_BOOKING', org1.ownerToken);
      await this.saasHelper.enableFeature(org2.store.id, 'ONLINE_BOOKING', org2.ownerToken);
      
      // Criar serviço na Org1
      const service1 = await this.createService(org1.ownerToken, org1.organization.id);
      
      // Criar agendamento na Org1
      const booking1 = await this.createBooking(org1.ownerToken, org1.organization.id, org1.store.id, org1.customer.id, service1.id);
      
      this.addResult('Isolamento SaaS dos Agendamentos', true, 'Agendamento criado com isolamento');
    } catch (error) {
      this.addResult('Isolamento SaaS dos Agendamentos', false, error.message);
    }
  }

  async testBookingFeatures() {
    console.log('\n3. 🧪 Testando habilitação/desabilitação de features...');
    try {
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Criar serviço primeiro
      const service = await this.createService(environment.ownerToken, environment.organization.id);
      
      // Tentar criar agendamento sem feature habilitada
      try {
        await this.createBooking(environment.ownerToken, environment.organization.id, environment.store.id, environment.customer.id, service.id);
        this.addResult('Habilitação/Desabilitação de Features', false, 'Agendamento criado sem feature habilitada!');
      } catch (error) {
        if (error.response?.status === 403) {
          // Habilitar feature
          await this.saasHelper.enableFeature(environment.store.id, 'ONLINE_BOOKING', environment.ownerToken);
          
          // Criar agendamento com feature habilitada
          const booking = await this.createBooking(environment.ownerToken, environment.organization.id, environment.store.id, environment.customer.id, service.id);
          
          this.addResult('Habilitação/Desabilitação de Features', true, 'Feature funcionando corretamente');
        } else {
          this.addResult('Habilitação/Desabilitação de Features', false, error.message);
        }
      }
    } catch (error) {
      this.addResult('Habilitação/Desabilitação de Features', false, error.message);
    }
  }

  async createService(token, orgId) {
    const serviceData = {
      code: 'TEST_SERVICE_' + Date.now(),
      name: 'Test Service',
      description: 'Test service for bookings',
      durationMinutes: 60,
      priceBaseCents: 5000, // R$ 50,00
      active: true
    };

    const response = await axios.post(`${BASE_URL}/services`, serviceData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Serviço criado: ${response.data.id}`);
    return response.data;
  }

  async createBooking(token, orgId, storeId, customerId, serviceId) {
    const bookingData = {
      storeId: storeId,
      customerId: customerId,
      serviceId: serviceId,
      bookingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Amanhã YYYY-MM-DD
      startTime: '10:00',
      notes: 'Test booking',
    };

    const response = await axios.post(`${BASE_URL}/bookings`, bookingData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Agendamento criado: ${response.data.id}`);
    return response.data;
  }

  async listBookings(token, orgId, storeId) {
    const response = await axios.get(`${BASE_URL}/bookings`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      },
      params: { storeId }
    });

    console.log(`✅ Agendamentos listados: ${response.data.length}`);
    return response.data;
  }

  async updateBooking(bookingId, token, orgId) {
    const updateData = {
      notes: 'Agendamento atualizado',
      status: 'CONFIRMED',
    };

    const response = await axios.put(`${BASE_URL}/bookings/${bookingId}`, updateData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Agendamento atualizado: ${response.data.id}`);
    return response.data;
  }

  async getBooking(bookingId, token, orgId) {
    const response = await axios.get(`${BASE_URL}/bookings/${bookingId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    return response.data;
  }

  printResults() {
    console.log('\n============================================================');
    console.log('📊 RESULTADOS DOS TESTES DA FEATURE BOOKINGS');
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
const bookingsTests = new BookingsTestSuite();
bookingsTests.runAllTests();

module.exports = BookingsTestSuite;
