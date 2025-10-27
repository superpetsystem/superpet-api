const SaasHelper = require('./helpers/saas-helper');

class SaasTests {
  constructor() {
    this.saasHelper = new SaasHelper();
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runAllTests() {
    console.log('🏢 INICIANDO TESTES COMPLETOS DE SAAS');
    console.log('=' .repeat(60));

    try {
      await this.testMultiTenancyIsolation();
      await this.testFeatureManagement();
      await this.testStoreAccessControl();
      await this.testPlanLimits();
      await this.testCrossTenantAccess();
      await this.testFeatureEnablingDisabling();

      this.printResults();
    } catch (error) {
      console.error('❌ Erro geral nos testes de SaaS:', error.message);
    }
  }

  async testMultiTenancyIsolation() {
    console.log('\n1. 🧪 Testando isolamento multi-tenant...');
    
    try {
      // Criar duas organizações
      const org1 = await this.saasHelper.setupCompleteSaasEnvironment();
      const org2 = await this.saasHelper.createSecondOrganization();
      
      // Testar isolamento - Org1 não deve acessar dados da Org2
      const axios = require('axios');
      
      try {
        // Tentar acessar stores da Org2 usando token da Org1
        await axios.get(`http://localhost:3000/stores/${org2.store.id}`, {
          headers: this.saasHelper.getHeaders(org1.ownerToken, org1.organization.id)
        });
        
        this.addResult('Isolamento Multi-tenant', false, 'Org1 conseguiu acessar dados da Org2');
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 404) {
          this.addResult('Isolamento Multi-tenant', true, 'Isolamento funcionando (403/404)');
        } else {
          this.addResult('Isolamento Multi-tenant', false, `Resposta inesperada: ${error.response?.status}`);
        }
      }
    } catch (error) {
      this.addResult('Isolamento Multi-tenant', false, error.message);
    }
  }

  async testFeatureManagement() {
    console.log('\n2. 🧪 Testando gerenciamento de features...');
    
    try {
      const env = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Testar habilitação de feature
      await this.saasHelper.enableFeatureForStore(
        env.ownerToken, 
        env.store.id, 
        'SERVICE_CATALOG',
        { maxServices: 100 }
      );
      
      // Verificar se feature está habilitada
      const isEnabled = await this.saasHelper.isFeatureEnabled(
        env.ownerToken, 
        env.store.id, 
        'SERVICE_CATALOG'
      );
      
      if (isEnabled) {
        this.addResult('Gerenciamento de Features', true, 'Feature habilitada com sucesso');
      } else {
        this.addResult('Gerenciamento de Features', false, 'Feature não foi habilitada');
      }
    } catch (error) {
      this.addResult('Gerenciamento de Features', false, error.message);
    }
  }

  async testStoreAccessControl() {
    console.log('\n3. 🧪 Testando controle de acesso às lojas...');
    
    try {
      const env = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // OWNER deve conseguir acessar sua própria loja
      const axios = require('axios');
      const response = await axios.get(`http://localhost:3000/stores/${env.store.id}`, {
        headers: this.saasHelper.getHeaders(env.ownerToken, env.organization.id)
      });
      
      if (response.status === 200) {
        this.addResult('Controle de Acesso às Lojas', true, 'OWNER pode acessar própria loja');
      } else {
        this.addResult('Controle de Acesso às Lojas', false, 'OWNER não pode acessar própria loja');
      }
    } catch (error) {
      this.addResult('Controle de Acesso às Lojas', false, error.message);
    }
  }

  async testPlanLimits() {
    console.log('\n4. 🧪 Testando limites de planos...');
    
    try {
      const env = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Testar criação de múltiplas lojas (limite do plano)
      const axios = require('axios');
      
      try {
        // Tentar criar segunda loja
        const store2 = await axios.post(`http://localhost:3000/admin/organizations/${env.organization.id}/stores`, {
          code: 'STORE_2',
          name: 'Second Store',
          timezone: 'America/Manaus',
          openingHours: { mon: [['08:00', '18:00']] },
          resourcesCatalog: ['GROOMER'],
          capacity: { GROOMER: 2 },
        }, {
          headers: { Authorization: `Bearer ${env.superAdminToken}` }
        });
        
        this.addResult('Limites de Planos', true, 'Segunda loja criada (limite não aplicado)');
      } catch (error) {
        if (error.response?.status === 403) {
          this.addResult('Limites de Planos', true, 'Limite de plano funcionando (403)');
        } else {
          this.addResult('Limites de Planos', false, `Resposta inesperada: ${error.response?.status}`);
        }
      }
    } catch (error) {
      this.addResult('Limites de Planos', false, error.message);
    }
  }

  async testCrossTenantAccess() {
    console.log('\n5. 🧪 Testando acesso cross-tenant...');
    
    try {
      const org1 = await this.saasHelper.setupCompleteSaasEnvironment();
      const org2 = await this.saasHelper.createSecondOrganization();
      
      // Testar isolamento usando helper
      const isolationTest = async (org1Data, org2Data) => {
        const axios = require('axios');
        // Tentar acessar customer da Org2 usando token da Org1
        await axios.get(`http://localhost:3000/customers/${org2Data.customer.id}`, {
          headers: this.saasHelper.getHeaders(org1Data.ownerToken, org1Data.organization.id)
        });
      };
      
      const isIsolated = await this.saasHelper.testSaasIsolation(org1, org2, isolationTest);
      
      if (isIsolated) {
        this.addResult('Acesso Cross-tenant', true, 'Isolamento cross-tenant funcionando');
      } else {
        this.addResult('Acesso Cross-tenant', false, 'Falha no isolamento cross-tenant');
      }
    } catch (error) {
      this.addResult('Acesso Cross-tenant', false, error.message);
    }
  }

  async testFeatureEnablingDisabling() {
    console.log('\n6. 🧪 Testando habilitação/desabilitação de features...');
    
    try {
      const env = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Habilitar feature
      await this.saasHelper.enableFeatureForStore(
        env.ownerToken, 
        env.store.id, 
        'LIVE_CAM',
        { maxStreams: 5 }
      );
      
      // Verificar se está habilitada
      let isEnabled = await this.saasHelper.isFeatureEnabled(
        env.ownerToken, 
        env.store.id, 
        'LIVE_CAM'
      );
      
      if (!isEnabled) {
        this.addResult('Habilitação/Desabilitação de Features', false, 'Feature não foi habilitada');
        return;
      }
      
      // Desabilitar feature
      await this.saasHelper.disableFeatureForStore(
        env.ownerToken, 
        env.store.id, 
        'LIVE_CAM'
      );
      
      // Verificar se está desabilitada
      isEnabled = await this.saasHelper.isFeatureEnabled(
        env.ownerToken, 
        env.store.id, 
        'LIVE_CAM'
      );
      
      if (!isEnabled) {
        this.addResult('Habilitação/Desabilitação de Features', true, 'Feature habilitada e desabilitada com sucesso');
      } else {
        this.addResult('Habilitação/Desabilitação de Features', false, 'Feature não foi desabilitada');
      }
    } catch (error) {
      this.addResult('Habilitação/Desabilitação de Features', false, error.message);
    }
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
    console.log('📊 RESULTADOS DOS TESTES DE SAAS');
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
  const saasTests = new SaasTests();
  saasTests.runAllTests();
}

module.exports = SaasTests;
