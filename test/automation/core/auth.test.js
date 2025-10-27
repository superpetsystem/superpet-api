const AuthHelper = require('./helpers/auth-helper');

class AuthTests {
  constructor() {
    this.authHelper = new AuthHelper();
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runAllTests() {
    console.log('🔐 INICIANDO TESTES COMPLETOS DE AUTENTICAÇÃO');
    console.log('=' .repeat(60));

    try {
      await this.testSuperAdminLogin();
      await this.testOrganizationCreation();
      await this.testOwnerCreation();
      await this.testStaffCreation();
      await this.testCustomerCreation();
      await this.testRoleBasedAccess();
      await this.testTokenValidation();

      this.printResults();
    } catch (error) {
      console.error('❌ Erro geral nos testes de Auth:', error.message);
    }
  }

  async testSuperAdminLogin() {
    console.log('\n1. 🧪 Testando login SUPER_ADMIN...');
    
    try {
      const token = await this.authHelper.loginSuperAdmin();
      
      if (token && token.length > 0) {
        this.addResult('SUPER_ADMIN Login', true, 'Token obtido com sucesso');
      } else {
        this.addResult('SUPER_ADMIN Login', false, 'Token vazio');
      }
    } catch (error) {
      this.addResult('SUPER_ADMIN Login', false, error.message);
    }
  }

  async testOrganizationCreation() {
    console.log('\n2. 🧪 Testando criação de organização...');
    
    try {
      const superAdminToken = await this.authHelper.loginSuperAdmin();
      const org = await this.authHelper.createTestOrganization(superAdminToken);
      
      if (org && org.id) {
        this.addResult('Criação de Organização', true, `Org criada: ${org.id}`);
      } else {
        this.addResult('Criação de Organização', false, 'Organização não criada');
      }
    } catch (error) {
      this.addResult('Criação de Organização', false, error.message);
    }
  }

  async testOwnerCreation() {
    console.log('\n3. 🧪 Testando criação de OWNER...');
    
    try {
      const superAdminToken = await this.authHelper.loginSuperAdmin();
      const org = await this.authHelper.createTestOrganization(superAdminToken);
      const owner = await this.authHelper.createTestOwner(superAdminToken, org.id);
      
      if (owner && owner.user && owner.user.email) {
        this.addResult('Criação de OWNER', true, `Owner criado: ${owner.user.email}`);
      } else {
        this.addResult('Criação de OWNER', false, 'Owner não criado');
      }
    } catch (error) {
      this.addResult('Criação de OWNER', false, error.message);
    }
  }

  async testStaffCreation() {
    console.log('\n4. 🧪 Testando criação de STAFF...');
    
    try {
      const superAdminToken = await this.authHelper.loginSuperAdmin();
      const org = await this.authHelper.createTestOrganization(superAdminToken);
      const owner = await this.authHelper.createTestOwner(superAdminToken, org.id);
      const ownerToken = await this.authHelper.loginOwner(owner.user.email, 'senha123');
      
      // Criar loja primeiro
      const store = await this.createTestStore(superAdminToken, org.id);
      
      const staff = await this.authHelper.createTestStaff(ownerToken, org.id, store.id);
      
      if (staff && staff.id) {
        this.addResult('Criação de STAFF', true, `Staff criado: ${staff.id}`);
      } else {
        this.addResult('Criação de STAFF', false, 'Staff não criado');
      }
    } catch (error) {
      this.addResult('Criação de STAFF', false, error.message);
    }
  }

  async testCustomerCreation() {
    console.log('\n5. 🧪 Testando criação de Customer...');
    
    try {
      const superAdminToken = await this.authHelper.loginSuperAdmin();
      const org = await this.authHelper.createTestOrganization(superAdminToken);
      const owner = await this.authHelper.createTestOwner(superAdminToken, org.id);
      const ownerToken = await this.authHelper.loginOwner(owner.user.email, 'senha123');
      
      const customer = await this.authHelper.createCustomer(ownerToken, org.id);
      
      if (customer && customer.id) {
        this.addResult('Criação de Customer', true, `Customer criado: ${customer.id}`);
      } else {
        this.addResult('Criação de Customer', false, 'Customer não criado');
      }
    } catch (error) {
      this.addResult('Criação de Customer', false, error.message);
    }
  }

  async testRoleBasedAccess() {
    console.log('\n6. 🧪 Testando controle de acesso baseado em roles...');
    
    try {
      const superAdminToken = await this.authHelper.loginSuperAdmin();
      const org = await this.authHelper.createTestOrganization(superAdminToken);
      const owner = await this.authHelper.createTestOwner(superAdminToken, org.id);
      const ownerToken = await this.authHelper.loginOwner(owner.user.email, 'senha123');
      
      // Testar se OWNER pode acessar recursos da própria organização
      const customer = await this.authHelper.createCustomer(ownerToken, org.id);
      
      if (customer && customer.id) {
        this.addResult('Controle de Acesso por Role', true, 'OWNER pode criar customer');
      } else {
        this.addResult('Controle de Acesso por Role', false, 'OWNER não pode criar customer');
      }
    } catch (error) {
      this.addResult('Controle de Acesso por Role', false, error.message);
    }
  }

  async testTokenValidation() {
    console.log('\n7. 🧪 Testando validação de token...');
    
    try {
      const token = await this.authHelper.loginSuperAdmin();
      
      // Testar token válido
      const axios = require('axios');
      const response = await axios.get('http://localhost:3000/admin/organizations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 200) {
        this.addResult('Validação de Token', true, 'Token válido aceito');
      } else {
        this.addResult('Validação de Token', false, 'Token válido rejeitado');
      }
    } catch (error) {
      this.addResult('Validação de Token', false, error.message);
    }
  }

  async createTestStore(superAdminToken, orgId) {
    const axios = require('axios');
    const timestamp = Date.now();
    const storeData = {
      code: `STORE_${timestamp}`,
      name: 'Test Store',
      timezone: 'America/Manaus',
      openingHours: { mon: [['08:00', '18:00']] },
      resourcesCatalog: ['GROOMER'],
      capacity: { GROOMER: 2 },
    };

    const response = await axios.post(`http://localhost:3000/admin/organizations/${orgId}/stores`, storeData, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    
    return response.data;
  }

  addResult(testName, passed, message) {
    this.results.tests.push({
      name: testName,
      passed,
      message
    });
    
    if (passed) {
      this.results.passed++;
      console.log(`✅ ${testName}: ${message}`);
    } else {
      this.results.failed++;
      console.log(`❌ ${testName}: ${message}`);
    }
  }

  printResults() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RESULTADOS DOS TESTES DE AUTENTICAÇÃO');
    console.log('=' .repeat(60));
    console.log(`✅ Passou: ${this.results.passed}`);
    console.log(`❌ Falhou: ${this.results.failed}`);
    console.log(`📈 Total: ${this.results.passed + this.results.failed}`);
    console.log(`🎯 Taxa de Sucesso: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Testes que falharam:');
      this.results.tests
        .filter(t => !t.passed)
        .forEach(t => console.log(`   - ${t.name}: ${t.message}`));
    }
    
    console.log('=' .repeat(60));
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const authTests = new AuthTests();
  authTests.runAllTests();
}

module.exports = AuthTests;
