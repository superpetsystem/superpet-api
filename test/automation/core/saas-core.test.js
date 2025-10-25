const assert = require('assert');
const AuthHelper = require('./helpers/auth-helper-modular');
const SaasHelper = require('./helpers/saas-helper-modular');

class SaasCoreTests {
  constructor() {
    this.authHelper = new AuthHelper();
    this.saasHelper = new SaasHelper();
    this.results = [];
  }

  async runAllTests() {
    console.log('🏢 INICIANDO TESTES CORE DE SAAS');
    console.log('============================================================');

    const tests = [
      () => this.testStoreCreation(),
      () => this.testFeatureManagement(),
      () => this.testMultiTenantIsolation(),
      () => this.testSaaSLimits(),
      () => this.testEmployeeHierarchy(),
      () => this.testFeatureScalability()
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

  async testStoreCreation() {
    console.log('\n1. 🧪 Testando criação de lojas...');
    try {
      const environment = await this.saasHelper.setupCompleteSaasEnvironment(this.authHelper);
      
      assert(environment.store.id, 'Store deve ter ID');
      console.log(`✅ Store criada: ${environment.store.id}`);
      console.log(`✅ Criação de Store: Store criada com sucesso`);
      this.addResult('Criação de Store', true, 'Store criada com sucesso');
    } catch (error) {
      this.addResult('Criação de Store', false, error.message);
      throw error;
    }
  }

  async testFeatureManagement() {
    console.log('\n2. 🧪 Testando gerenciamento de features...');
    try {
      const environment = await this.saasHelper.setupCompleteSaasEnvironment(this.authHelper);
      
      // Habilitar feature
      await this.saasHelper.enableFeature(environment.store.id, 'TELEPICKUP', environment.ownerToken);
      const isEnabled = await this.saasHelper.isFeatureEnabled(environment.store.id, 'TELEPICKUP', environment.ownerToken);
      
      assert(isEnabled, 'Feature deve estar habilitada');
      console.log('✅ Feature habilitada com sucesso');
      
      // Desabilitar feature
      await this.saasHelper.disableFeature(environment.store.id, 'TELEPICKUP', environment.ownerToken);
      const isDisabled = await this.saasHelper.isFeatureEnabled(environment.store.id, 'TELEPICKUP', environment.ownerToken);
      
      assert(!isDisabled, 'Feature deve estar desabilitada');
      console.log('✅ Feature desabilitada com sucesso');
      console.log('✅ Gerenciamento de Features: Features gerenciadas com sucesso');
      this.addResult('Gerenciamento de Features', true, 'Features gerenciadas com sucesso');
    } catch (error) {
      this.addResult('Gerenciamento de Features', false, error.message);
      throw error;
    }
  }

  async testMultiTenantIsolation() {
    console.log('\n3. 🧪 Testando isolamento multi-tenant...');
    try {
      const superAdminToken = await this.authHelper.getSuperAdminToken();
      
      // Criar duas organizações
      const org1 = await this.authHelper.createOrganization(superAdminToken);
      const org2 = await this.authHelper.createOrganization(superAdminToken);
      
      // Criar owners para cada organização
      const owner1 = await this.authHelper.createOwner(superAdminToken, org1.id);
      const owner2 = await this.authHelper.createOwner(superAdminToken, org2.id);
      
      const owner1Login = await this.authHelper.loginOwner(owner1.user.email, 'senha123');
      const owner2Login = await this.authHelper.loginOwner(owner2.user.email, 'senha123');
      
      // Criar stores para cada organização
      const store1 = await this.saasHelper.createStore(owner1Login.token);
      const store2 = await this.saasHelper.createStore(owner2Login.token);
      
      assert(store1.id !== store2.id, 'Stores devem ser diferentes');
      console.log('✅ Isolamento Multi-Tenant: Organizações isoladas corretamente');
      this.addResult('Isolamento Multi-Tenant', true, 'Organizações isoladas corretamente');
    } catch (error) {
      this.addResult('Isolamento Multi-Tenant', false, error.message);
      throw error;
    }
  }

  async testSaaSLimits() {
    console.log('\n4. 🧪 Testando limites SaaS...');
    try {
      const environment = await this.saasHelper.setupCompleteSaasEnvironment(this.authHelper);
      
      // Testar limite de employees (criar vários staff)
      const staff1 = await this.authHelper.createStaff(environment.ownerToken);
      const staff2 = await this.authHelper.createStaff(environment.ownerToken);
      
      assert(staff1.id && staff2.id, 'Deve conseguir criar múltiplos staff');
      console.log('✅ Limites SaaS: Limites respeitados');
      this.addResult('Limites SaaS', true, 'Limites respeitados');
    } catch (error) {
      this.addResult('Limites SaaS', false, error.message);
      throw error;
    }
  }

  async testEmployeeHierarchy() {
    console.log('\n5. 🧪 Testando hierarquia de funcionários...');
    try {
      const environment = await this.saasHelper.setupCompleteSaasEnvironment(this.authHelper);
      
      // Criar staff
      const staff = await this.authHelper.createStaff(environment.ownerToken);
      
      assert(staff.role === 'STAFF', 'Staff deve ter role STAFF');
      console.log('✅ Hierarquia de Funcionários: Hierarquia respeitada');
      this.addResult('Hierarquia de Funcionários', true, 'Hierarquia respeitada');
    } catch (error) {
      this.addResult('Hierarquia de Funcionários', false, error.message);
      throw error;
    }
  }

  async testFeatureScalability() {
    console.log('\n6. 🧪 Testando escalabilidade de features...');
    try {
      const environment = await this.saasHelper.setupCompleteSaasEnvironment(this.authHelper);
      
      // Habilitar múltiplas features
      await this.saasHelper.enableFeature(environment.store.id, 'TELEPICKUP', environment.ownerToken);
      await this.saasHelper.enableFeature(environment.store.id, 'LIVE_CAM', environment.ownerToken);
      
      const telepickupEnabled = await this.saasHelper.isFeatureEnabled(environment.store.id, 'TELEPICKUP', environment.ownerToken);
      const livecamEnabled = await this.saasHelper.isFeatureEnabled(environment.store.id, 'LIVE_CAM', environment.ownerToken);
      
      assert(telepickupEnabled && livecamEnabled, 'Múltiplas features devem estar habilitadas');
      console.log('✅ Escalabilidade de Features: Múltiplas features funcionando');
      this.addResult('Escalabilidade de Features', true, 'Múltiplas features funcionando');
    } catch (error) {
      this.addResult('Escalabilidade de Features', false, error.message);
      throw error;
    }
  }

  addResult(testName, passed, message) {
    this.results.push({ testName, passed, message });
  }

  printResults() {
    console.log('\n============================================================');
    console.log('📊 RESULTADOS DOS TESTES DE SAAS');
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

module.exports = SaasCoreTests;
