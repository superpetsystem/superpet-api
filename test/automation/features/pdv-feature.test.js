const assert = require('assert');
const axios = require('axios');
const AuthHelper = require('../core/helpers/auth-helper-modular');
const SaasHelper = require('../core/helpers/saas-helper-modular');

const BASE_URL = 'http://localhost:3000';

class PdvFeatureTests {
  constructor() {
    this.authHelper = new AuthHelper();
    this.saasHelper = new SaasHelper();
    this.results = [];
  }

  async runAllTests() {
    console.log('🛒 INICIANDO TESTES DE FEATURE PDV');
    console.log('============================================================');

    const tests = [
      () => this.testPdvCartCreation(),
      () => this.testPdvItemManagement(),
      () => this.testPdvFeatureIsolation(),
      () => this.testPdvCompleteFlow()
    ];

    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        this.addResult('Teste', false, error.message);
      }
    }

    this.printResults();
    return this.getResults();
  }

  async testPdvCartCreation() {
    console.log('\n1. 🧪 Testando criação de carrinho PDV...');
    try {
      // Usar helper para configurar ambiente completo
      const environment = await this.saasHelper.setupCompleteSaasEnvironment(this.authHelper);
      
      // Habilitar feature PDV
      await this.saasHelper.enableFeature(environment.store.id, 'PDV_POINT_OF_SALE', environment.ownerToken);
      
      // Criar carrinho
      const cartData = {
        storeId: environment.store.id,
        customerId: environment.customer.id,
        employeeId: environment.owner.userId
      };

      const response = await axios.post(`${BASE_URL}/pdv/carts`, cartData, {
        headers: { 
          Authorization: `Bearer ${environment.ownerToken}`,
          'X-Organization-Id': environment.organization.id
        }
      });

      assert(response.data.id, 'Carrinho deve ter ID');
      console.log(`✅ Carrinho criado: ${response.data.id}`);
      console.log('✅ Criação de Carrinho: Carrinho criado com sucesso');
      this.addResult('Criação de Carrinho', true, 'Carrinho criado com sucesso');
    } catch (error) {
      this.addResult('Criação de Carrinho', false, error.message);
      throw error;
    }
  }

  async testPdvItemManagement() {
    console.log('\n2. 🧪 Testando gerenciamento de itens PDV...');
    try {
      const environment = await this.saasHelper.setupCompleteSaasEnvironment(this.authHelper);
      await this.saasHelper.enableFeature(environment.store.id, 'PDV_POINT_OF_SALE', environment.ownerToken);
      
      // Criar carrinho primeiro
      const cartResponse = await axios.post(`${BASE_URL}/pdv/carts`, {
        storeId: environment.store.id,
        customerId: environment.customer.id,
        employeeId: environment.owner.userId
      }, {
        headers: { 
          Authorization: `Bearer ${environment.ownerToken}`,
          'X-Organization-Id': environment.organization.id
        }
      });

      const cartId = cartResponse.data.id;

      // Adicionar item ao carrinho
      const itemData = {
        itemType: 'PRODUCT',
        itemName: 'Produto Teste',
        quantity: 2,
        unitPrice: 25.50
      };

      const itemResponse = await axios.post(`${BASE_URL}/pdv/carts/${cartId}/items`, itemData, {
        headers: { 
          Authorization: `Bearer ${environment.ownerToken}`,
          'X-Organization-Id': environment.organization.id
        }
      });

      assert(itemResponse.data.id, 'Item deve ter ID');
      console.log(`✅ Item adicionado: ${itemResponse.data.id}`);
      console.log('✅ Gerenciamento de Itens: Item adicionado com sucesso');
      this.addResult('Gerenciamento de Itens', true, 'Item adicionado com sucesso');
    } catch (error) {
      this.addResult('Gerenciamento de Itens', false, error.message);
      throw error;
    }
  }

  async testPdvFeatureIsolation() {
    console.log('\n3. 🧪 Testando isolamento de feature PDV...');
    try {
      const environment = await this.saasHelper.setupCompleteSaasEnvironment(this.authHelper);
      
      // Tentar criar carrinho sem feature habilitada (deve falhar)
      try {
        await axios.post(`${BASE_URL}/pdv/carts`, {
          storeId: environment.store.id,
          customerId: environment.customer.id,
          employeeId: environment.owner.userId
        }, {
          headers: { 
            Authorization: `Bearer ${environment.ownerToken}`,
            'X-Organization-Id': environment.organization.id
          }
        });
        
        throw new Error('Deveria ter falhado sem feature habilitada');
      } catch (error) {
        if (error.response && error.response.status === 403) {
          console.log('✅ Feature bloqueada corretamente sem habilitação');
        } else {
          throw error;
        }
      }

      // Habilitar feature e tentar novamente
      await this.saasHelper.enableFeature(environment.store.id, 'PDV_POINT_OF_SALE', environment.ownerToken);
      
      const cartResponse = await axios.post(`${BASE_URL}/pdv/carts`, {
        storeId: environment.store.id,
        customerId: environment.customer.id,
        employeeId: environment.owner.userId
      }, {
        headers: { 
          Authorization: `Bearer ${environment.ownerToken}`,
          'X-Organization-Id': environment.organization.id
        }
      });

      assert(cartResponse.data.id, 'Carrinho deve ser criado com feature habilitada');
      console.log('✅ Isolamento de Feature: Feature controlada corretamente');
      this.addResult('Isolamento de Feature', true, 'Feature controlada corretamente');
    } catch (error) {
      this.addResult('Isolamento de Feature', false, error.message);
      throw error;
    }
  }

  async testPdvCompleteFlow() {
    console.log('\n4. 🧪 Testando fluxo completo PDV...');
    try {
      const environment = await this.saasHelper.setupCompleteSaasEnvironment(this.authHelper);
      await this.saasHelper.enableFeature(environment.store.id, 'PDV_POINT_OF_SALE', environment.ownerToken);
      
      // 1. Criar carrinho
      const cartResponse = await axios.post(`${BASE_URL}/pdv/carts`, {
        storeId: environment.store.id,
        customerId: environment.customer.id,
        employeeId: environment.owner.userId
      }, {
        headers: { 
          Authorization: `Bearer ${environment.ownerToken}`,
          'X-Organization-Id': environment.organization.id
        }
      });

      const cartId = cartResponse.data.id;

      // 2. Adicionar item
      await axios.post(`${BASE_URL}/pdv/carts/${cartId}/items`, {
        itemType: 'PRODUCT',
        itemName: 'Produto Teste',
        quantity: 1,
        unitPrice: 50.00
      }, {
        headers: { 
          Authorization: `Bearer ${environment.ownerToken}`,
          'X-Organization-Id': environment.organization.id
        }
      });

      // 3. Buscar carrinho
      const getCartResponse = await axios.get(`${BASE_URL}/pdv/carts/${cartId}`, {
        headers: { 
          Authorization: `Bearer ${environment.ownerToken}`,
          'X-Organization-Id': environment.organization.id
        }
      });

      assert(getCartResponse.data.id === cartId, 'Carrinho deve ser encontrado');
      console.log('✅ Fluxo Completo PDV: Fluxo executado com sucesso');
      this.addResult('Fluxo Completo PDV', true, 'Fluxo executado com sucesso');
    } catch (error) {
      this.addResult('Fluxo Completo PDV', false, error.message);
      throw error;
    }
  }

  addResult(testName, passed, message) {
    this.results.push({ testName, passed, message });
  }

  printResults() {
    console.log('\n============================================================');
    console.log('📊 RESULTADOS DOS TESTES DE FEATURE PDV');
    console.log('============================================================');
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    const successRate = ((passed / total) * 100).toFixed(1);
    
    console.log(`✅ Passou: ${passed}`);
    console.log(`❌ Falhou: ${failed}`);
    console.log(`📈 Total: ${total}`);
    console.log(`🎯 Taxa de Sucesso: ${successRate}%`);
    console.log('============================================================');
  }

  getResults() {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    return { passed, total, results: this.results };
  }
}

module.exports = PdvFeatureTests;
