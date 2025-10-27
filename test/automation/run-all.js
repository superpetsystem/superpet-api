const AuthTests = require('./core/auth.test');
const SaasTests = require('./core/saas.test');
const PdvFeatureTests = require('./features/pdv.test');
const InventoryFeatureTests = require('./features/inventory.test');
const BookingsFeatureTests = require('./features/bookings.test');
const LiveCamFeatureTests = require('./features/livecam.test');
const VeterinaryFeatureTests = require('./features/veterinary.test');
const ReportsFeatureTests = require('./features/reports.test');
const PickupsFeatureTests = require('./features/pickups.test');
const ServicesFeatureTests = require('./features/services.test');
const StoresFeatureTests = require('./features/stores.test');
const CustomersFeatureTests = require('./features/customers.test');
const PetsFeatureTests = require('./features/pets.test');
const EmployeesFeatureTests = require('./features/employees.test');

class TestOrchestrator {
  constructor() {
    this.results = {
      auth: { passed: 0, failed: 0, tests: [] },
      saas: { passed: 0, failed: 0, tests: [] },
      features: { passed: 0, failed: 0, tests: [] },
      total: { passed: 0, failed: 0 }
    };
  }

  async runAllTests() {
    console.log('🚀 INICIANDO SUITE COMPLETA DE TESTES AUTOMATIZADOS');
    console.log('=' .repeat(80));
    console.log('📋 Estrutura:');
    console.log('   🔐 Core Tests (Auth + SaaS)');
    console.log('   🛒 Feature Tests (PDV + outras features)');
    console.log('   🔄 Execução paralela quando possível');
    console.log('=' .repeat(80));

    const startTime = Date.now();

    try {
      // Executar testes core em paralelo
      console.log('\n🔄 Executando testes core em paralelo...');
      const [authResults, saasResults] = await Promise.all([
        this.runAuthTests(),
        this.runSaasTests()
      ]);

      // Executar testes de features sequencialmente (podem depender dos core)
      console.log('\n🔄 Executando testes de features...');
      const featureResults = await this.runFeatureTests();

      // Consolidar resultados
      this.results.auth = authResults;
      this.results.saas = saasResults;
      this.results.features = featureResults;

      this.results.total.passed = 
        this.results.auth.passed + 
        this.results.saas.passed + 
        this.results.features.passed;

      this.results.total.failed = 
        this.results.auth.failed + 
        this.results.saas.failed + 
        this.results.features.failed;

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      this.printFinalResults(duration);

    } catch (error) {
      console.error('❌ Erro geral na execução dos testes:', error.message);
    }
  }

  async runAuthTests() {
    console.log('\n🔐 Executando testes de Autenticação...');
    const authTests = new AuthTests();
    await authTests.runAllTests();
    return authTests.results;
  }

  async runSaasTests() {
    console.log('\n🏢 Executando testes de SaaS...');
    const saasTests = new SaasTests();
    await saasTests.runAllTests();
    return saasTests.results;
  }

  async runFeatureTests() {
    console.log('\n🛒 Executando testes da feature PDV...');
    const pdvTests = new PdvFeatureTests();
    await pdvTests.runAllTests();
    
    console.log('\n📦 Executando testes da feature Inventory...');
    const inventoryTests = new InventoryFeatureTests();
    await inventoryTests.runAllTests();
    
    console.log('\n📅 Executando testes da feature Bookings...');
    const bookingsTests = new BookingsFeatureTests();
    await bookingsTests.runAllTests();
    
    console.log('\n📹 Executando testes da feature Live Cam...');
    const livecamTests = new LiveCamFeatureTests();
    await livecamTests.runAllTests();
    
    console.log('\n🏥 Executando testes da feature Veterinary...');
    const veterinaryTests = new VeterinaryFeatureTests();
    await veterinaryTests.runAllTests();
    
    console.log('\n📊 Executando testes da feature Reports...');
    const reportsTests = new ReportsFeatureTests();
    await reportsTests.runAllTests();
    
    console.log('\n🚚 Executando testes da feature Pickups...');
    const pickupsTests = new PickupsFeatureTests();
    await pickupsTests.runAllTests();
    
    console.log('\n🛠️ Executando testes da feature Services...');
    const servicesTests = new ServicesFeatureTests();
    await servicesTests.runAllTests();
    
    console.log('\n🏪 Executando testes da feature Stores...');
    const storesTests = new StoresFeatureTests();
    await storesTests.runAllTests();
    
    console.log('\n👥 Executando testes da feature Customers...');
    const customersTests = new CustomersFeatureTests();
    await customersTests.runAllTests();
    
    console.log('\n🐕 Executando testes da feature Pets...');
    const petsTests = new PetsFeatureTests();
    await petsTests.runAllTests();
    
    console.log('\n👨‍💼 Executando testes da feature Employees...');
    const employeesTests = new EmployeesFeatureTests();
    await employeesTests.runAllTests();
    
    // Consolidar resultados de todas as features
    const allFeatureResults = {
      passed: (pdvTests.results?.passed || 0) + (inventoryTests.results?.passed || 0) + (bookingsTests.results?.passed || 0) + 
              (livecamTests.results?.passed || 0) + (veterinaryTests.results?.passed || 0) + (reportsTests.results?.passed || 0) + 
              (pickupsTests.results?.passed || 0) + (servicesTests.results?.passed || 0) + (storesTests.results?.passed || 0) + 
              (customersTests.results?.passed || 0) + (petsTests.results?.passed || 0) + (employeesTests.results?.passed || 0),
      failed: (pdvTests.results?.failed || 0) + (inventoryTests.results?.failed || 0) + (bookingsTests.results?.failed || 0) + 
              (livecamTests.results?.failed || 0) + (veterinaryTests.results?.failed || 0) + (reportsTests.results?.failed || 0) + 
              (pickupsTests.results?.failed || 0) + (servicesTests.results?.failed || 0) + (storesTests.results?.failed || 0) + 
              (customersTests.results?.failed || 0) + (petsTests.results?.failed || 0) + (employeesTests.results?.failed || 0),
      tests: [
        ...(pdvTests.results?.tests || []).map(t => ({ ...t, feature: 'PDV' })),
        ...(inventoryTests.results?.tests || []).map(t => ({ ...t, feature: 'Inventory' })),
        ...(bookingsTests.results?.tests || []).map(t => ({ ...t, feature: 'Bookings' })),
        ...(livecamTests.results?.tests || []).map(t => ({ ...t, feature: 'LiveCam' })),
        ...(veterinaryTests.results?.tests || []).map(t => ({ ...t, feature: 'Veterinary' })),
        ...(reportsTests.results?.tests || []).map(t => ({ ...t, feature: 'Reports' })),
        ...(pickupsTests.results?.tests || []).map(t => ({ ...t, feature: 'Pickups' })),
        ...(servicesTests.results?.tests || []).map(t => ({ ...t, feature: 'Services' })),
        ...(storesTests.results?.tests || []).map(t => ({ ...t, feature: 'Stores' })),
        ...(customersTests.results?.tests || []).map(t => ({ ...t, feature: 'Customers' })),
        ...(petsTests.results?.tests || []).map(t => ({ ...t, feature: 'Pets' })),
        ...(employeesTests.results?.tests || []).map(t => ({ ...t, feature: 'Employees' }))
      ]
    };
    
    return allFeatureResults;
  }

  printFinalResults(duration) {
    console.log('\n' + '=' .repeat(80));
    console.log('🎯 RESULTADOS FINAIS DA SUITE DE TESTES');
    console.log('=' .repeat(80));
    
    console.log('\n📊 RESUMO POR CATEGORIA:');
    console.log(`🔐 Auth:     ${this.results.auth.passed}✅ ${this.results.auth.failed}❌ (${this.getSuccessRate(this.results.auth)}%)`);
    console.log(`🏢 SaaS:    ${this.results.saas.passed}✅ ${this.results.saas.failed}❌ (${this.getSuccessRate(this.results.saas)}%)`);
    console.log(`🛒 Features: ${this.results.features.passed}✅ ${this.results.features.failed}❌ (${this.getSuccessRate(this.results.features)}%)`);
    
    console.log('\n📈 TOTAL GERAL:');
    console.log(`✅ Passou: ${this.results.total.passed}`);
    console.log(`❌ Falhou: ${this.results.total.failed}`);
    console.log(`📊 Total: ${this.results.total.passed + this.results.total.failed}`);
    console.log(`🎯 Taxa de Sucesso Geral: ${this.getSuccessRate(this.results.total)}%`);
    console.log(`⏱️  Tempo Total: ${duration}s`);
    
    if (this.results.total.failed > 0) {
      console.log('\n❌ TESTES QUE FALHARAM:');
      
      if (this.results.auth.failed > 0) {
        console.log('\n🔐 Auth:');
        this.results.auth.tests
          .filter(t => !t.passed)
          .forEach(t => console.log(`   - ${t.name}: ${t.message}`));
      }
      
      if (this.results.saas.failed > 0) {
        console.log('\n🏢 SaaS:');
        this.results.saas.tests
          .filter(t => !t.passed)
          .forEach(t => console.log(`   - ${t.name}: ${t.message}`));
      }
      
      if (this.results.features.failed > 0) {
        console.log('\n🛒 Features:');
        this.results.features.tests
          .filter(t => !t.passed)
          .forEach(t => console.log(`   - ${t.name}: ${t.message}`));
      }
    }
    
    console.log('\n' + '=' .repeat(80));
    
    if (this.results.total.failed === 0) {
      console.log('🎉 TODOS OS TESTES PASSARAM! Sistema está funcionando perfeitamente!');
    } else {
      console.log('⚠️  Alguns testes falharam. Verifique os detalhes acima.');
    }
    
    console.log('=' .repeat(80));
  }

  getSuccessRate(results) {
    const total = results.passed + results.failed;
    return total > 0 ? ((results.passed / total) * 100).toFixed(1) : '0.0';
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const orchestrator = new TestOrchestrator();
  orchestrator.runAllTests();
}

module.exports = TestOrchestrator;
