const assert = require('assert');
const AuthHelper = require('./helpers/auth-helper-modular');

class AuthCoreTests {
  constructor() {
    this.authHelper = new AuthHelper();
    this.results = [];
  }

  async runAllTests() {
    console.log('🔐 INICIANDO TESTES CORE DE AUTENTICAÇÃO');
    console.log('============================================================');

    const tests = [
      () => this.testSuperAdminLogin(),
      () => this.testOrganizationCreation(),
      () => this.testOwnerCreation(),
      () => this.testStaffCreation(),
      () => this.testCustomerCreation(),
      () => this.testRoleBasedAccess(),
      () => this.testTokenValidation()
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

  async testSuperAdminLogin() {
    console.log('\n1. 🧪 Testando login SUPER_ADMIN...');
    try {
      const token = await this.authHelper.getSuperAdminToken();
      assert(token, 'Token deve ser retornado');
      console.log('✅ SUPER_ADMIN autenticado');
      console.log('✅ SUPER_ADMIN Login: Token obtido com sucesso');
      this.addResult('Login SUPER_ADMIN', true, 'Token obtido com sucesso');
    } catch (error) {
      this.addResult('Login SUPER_ADMIN', false, error.message);
      throw error;
    }
  }

  async testOrganizationCreation() {
    console.log('\n2. 🧪 Testando criação de organização...');
    try {
      const superAdminToken = await this.authHelper.getSuperAdminToken();
      const organization = await this.authHelper.createOrganization(superAdminToken);
      
      assert(organization.id, 'Organização deve ter ID');
      console.log(`✅ Organização criada: ${organization.id}`);
      console.log(`✅ Criação de Organização: Org criada: ${organization.id}`);
      this.addResult('Criação de Organização', true, `Org criada: ${organization.id}`);
    } catch (error) {
      this.addResult('Criação de Organização', false, error.message);
      throw error;
    }
  }

  async testOwnerCreation() {
    console.log('\n3. 🧪 Testando criação de OWNER...');
    try {
      const superAdminToken = await this.authHelper.getSuperAdminToken();
      const organization = await this.authHelper.createOrganization(superAdminToken);
      const owner = await this.authHelper.createOwner(superAdminToken, organization.id);
      
      assert(owner.email, 'OWNER deve ter email');
      console.log(`✅ OWNER criado: ${owner.email}`);
      console.log(`✅ Criação de OWNER: Owner criado: ${owner.email}`);
      this.addResult('Criação de OWNER', true, `Owner criado: ${owner.email}`);
    } catch (error) {
      this.addResult('Criação de OWNER', false, error.message);
      throw error;
    }
  }

  async testStaffCreation() {
    console.log('\n4. 🧪 Testando criação de STAFF...');
    try {
      const superAdminToken = await this.authHelper.getSuperAdminToken();
      const organization = await this.authHelper.createOrganization(superAdminToken);
      const owner = await this.authHelper.createOwner(superAdminToken, organization.id);
      const ownerLogin = await this.authHelper.loginOwner(owner.user.email, 'senha123');
      
      const staff = await this.authHelper.createStaff(ownerLogin.token);
      
      assert(staff.id, 'STAFF deve ter ID');
      console.log(`✅ STAFF criado: ${staff.id}`);
      console.log(`✅ Criação de STAFF: Staff criado: ${staff.id}`);
      this.addResult('Criação de STAFF', true, `Staff criado: ${staff.id}`);
    } catch (error) {
      this.addResult('Criação de STAFF', false, error.message);
      throw error;
    }
  }

  async testCustomerCreation() {
    console.log('\n5. 🧪 Testando criação de Customer...');
    try {
      const superAdminToken = await this.authHelper.getSuperAdminToken();
      const organization = await this.authHelper.createOrganization(superAdminToken);
      const owner = await this.authHelper.createOwner(superAdminToken, organization.id);
      const ownerLogin = await this.authHelper.loginOwner(owner.user.email, 'senha123');
      
      const customer = await this.authHelper.createCustomer(ownerLogin.token);
      
      assert(customer.id, 'Customer deve ter ID');
      console.log(`✅ Customer criado: ${customer.id}`);
      console.log(`✅ Criação de Customer: Customer criado: ${customer.id}`);
      this.addResult('Criação de Customer', true, `Customer criado: ${customer.id}`);
    } catch (error) {
      this.addResult('Criação de Customer', false, error.message);
      throw error;
    }
  }

  async testRoleBasedAccess() {
    console.log('\n6. 🧪 Testando controle de acesso baseado em roles...');
    try {
      const superAdminToken = await this.authHelper.getSuperAdminToken();
      const organization = await this.authHelper.createOrganization(superAdminToken);
      const owner = await this.authHelper.createOwner(superAdminToken, organization.id);
      const ownerLogin = await this.authHelper.loginOwner(owner.user.email, 'senha123');
      
      const customer = await this.authHelper.createCustomer(ownerLogin.token);
      
      assert(customer.id, 'OWNER deve conseguir criar customer');
      console.log('✅ Controle de Acesso por Role: OWNER pode criar customer');
      this.addResult('Controle de Acesso por Role', true, 'OWNER pode criar customer');
    } catch (error) {
      this.addResult('Controle de Acesso por Role', false, error.message);
      throw error;
    }
  }

  async testTokenValidation() {
    console.log('\n7. 🧪 Testando validação de token...');
    try {
      const token = await this.authHelper.getSuperAdminToken();
      const user = await this.authHelper.validateToken(token);
      
      assert(user.id, 'Token deve ser válido');
      console.log('✅ Validação de Token: Token válido aceito');
      this.addResult('Validação de Token', true, 'Token válido aceito');
    } catch (error) {
      this.addResult('Validação de Token', false, error.message);
      throw error;
    }
  }

  addResult(testName, passed, message) {
    this.results.push({ testName, passed, message });
  }

  printResults() {
    console.log('\n============================================================');
    console.log('📊 RESULTADOS DOS TESTES DE AUTENTICAÇÃO');
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

module.exports = AuthCoreTests;
