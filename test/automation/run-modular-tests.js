const AuthCoreTests = require('./core/auth-core.test');
const SaasCoreTests = require('./core/saas-core.test');
const PdvFeatureTests = require('./features/pdv-feature.test');

class ModularTestRunner {
  constructor() {
    this.results = {
      core: { auth: null, saas: null },
      features: {}
    };
  }

  async runAllTests() {
    console.log('\n🚀 INICIANDO ARQUITETURA MODULAR DE TESTES');
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                    SUPERPET API - TESTES MODULARES                  ║');
    console.log('║              Core (Paralelo) + Features (Sequencial)              ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
    console.log('');

    const startTime = Date.now();

    try {
      // 1. Executar testes CORE em paralelo
      console.log('🔧 EXECUTANDO TESTES CORE EM PARALELO...');
      console.log('============================================================');
      
      const coreResults = await this.runCoreTestsInParallel();
      
      // 2. Executar testes de FEATURES sequencialmente
      console.log('\n🎯 EXECUTANDO TESTES DE FEATURES...');
      console.log('============================================================');
      
      const featureResults = await this.runFeatureTestsSequentially();
      
      // 3. Consolidar resultados
      this.printFinalResults(coreResults, featureResults, Date.now() - startTime);
      
      return {
        core: coreResults,
        features: featureResults,
        totalTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('\n❌ ERRO GERAL NOS TESTES:', error.message);
      throw error;
    }
  }

  async runCoreTestsInParallel() {
    console.log('🔄 Iniciando testes core em paralelo...\n');
    
    const authTests = new AuthCoreTests();
    const saasTests = new SaasCoreTests();

    // Executar em paralelo
    const [authResults, saasResults] = await Promise.all([
      authTests.runAllTests(),
      saasTests.runAllTests()
    ]);

    this.results.core.auth = authResults;
    this.results.core.saas = saasResults;

    console.log('\n✅ TESTES CORE CONCLUÍDOS EM PARALELO');
    console.log(`   Auth: ${authResults.passed}/${authResults.total} passaram`);
    console.log(`   SaaS: ${saasResults.passed}/${saasResults.total} passaram`);

    return { auth: authResults, saas: saasResults };
  }

  async runFeatureTestsSequentially() {
    const featureTests = [
      { name: 'PDV', testClass: PdvFeatureTests },
      // Adicionar outras features aqui conforme necessário
    ];

    const results = {};

    for (const feature of featureTests) {
      console.log(`\n🎯 Executando testes da feature: ${feature.name}`);
      console.log('------------------------------------------------------------');
      
      try {
        const testInstance = new feature.testClass();
        const result = await testInstance.runAllTests();
        results[feature.name.toLowerCase()] = result;
        
        console.log(`✅ Feature ${feature.name}: ${result.passed}/${result.total} passaram`);
      } catch (error) {
        console.error(`❌ Erro na feature ${feature.name}:`, error.message);
        results[feature.name.toLowerCase()] = { passed: 0, total: 0, error: error.message };
      }
    }

    return results;
  }

  printFinalResults(coreResults, featureResults, totalTime) {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                        RESULTADOS FINAIS                           ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
    
    // Core Results
    console.log('\n🔧 TESTES CORE (Executados em Paralelo):');
    console.log('------------------------------------------------------------');
    console.log(`✅ Auth:     ${coreResults.auth.passed}/${coreResults.auth.total} passaram`);
    console.log(`✅ SaaS:     ${coreResults.saas.passed}/${coreResults.saas.total} passaram`);
    
    const coreTotal = coreResults.auth.total + coreResults.saas.total;
    const corePassed = coreResults.auth.passed + coreResults.saas.passed;
    console.log(`📊 Core Total: ${corePassed}/${coreTotal} passaram`);
    
    // Feature Results
    console.log('\n🎯 TESTES DE FEATURES (Executados Sequencialmente):');
    console.log('------------------------------------------------------------');
    
    let featureTotal = 0;
    let featurePassed = 0;
    
    Object.entries(featureResults).forEach(([name, result]) => {
      if (result.error) {
        console.log(`❌ ${name.toUpperCase()}: ERRO - ${result.error}`);
      } else {
        console.log(`✅ ${name.toUpperCase()}: ${result.passed}/${result.total} passaram`);
        featureTotal += result.total;
        featurePassed += result.passed;
      }
    });
    
    console.log(`📊 Features Total: ${featurePassed}/${featureTotal} passaram`);
    
    // Overall Results
    console.log('\n🏆 RESULTADO GERAL:');
    console.log('------------------------------------------------------------');
    const overallTotal = coreTotal + featureTotal;
    const overallPassed = corePassed + featurePassed;
    const successRate = ((overallPassed / overallTotal) * 100).toFixed(1);
    
    console.log(`✅ Total Passou: ${overallPassed}`);
    console.log(`❌ Total Falhou: ${overallTotal - overallPassed}`);
    console.log(`📈 Total Testes: ${overallTotal}`);
    console.log(`🎯 Taxa de Sucesso: ${successRate}%`);
    console.log(`⏱️  Tempo Total: ${(totalTime / 1000).toFixed(2)}s`);
    
    if (overallPassed === overallTotal) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM! SISTEMA 100% FUNCIONAL! 🎉');
    } else {
      console.log('\n⚠️  ALGUNS TESTES FALHARAM - REVISAR IMPLEMENTAÇÃO');
    }
    
    console.log('\n════════════════════════════════════════════════════════════════════');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const runner = new ModularTestRunner();
  runner.runAllTests()
    .then(() => {
      console.log('\n✅ Execução concluída com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Execução falhou:', error.message);
      process.exit(1);
    });
}

module.exports = ModularTestRunner;
