/**
 * 🧪 Executor de Todos os Testes
 * SuperPet API
 * 
 * Este script executa todos os testes automatizados
 * 
 * Como executar:
 * node test/automation/run-all-tests.js
 */

const { exec } = require('child_process');
const path = require('path');

function separator() {
  console.log('='.repeat(80));
}

function log(message, color = 'reset') {
  const prefix = {
    reset: '',
    green: '✅ ',
    red: '❌ ',
    yellow: '⚠️  ',
    blue: '🔵 ',
    cyan: '💡 ',
  };
  console.log(`${prefix[color] || ''}${message}`);
}

function runTest(testPath, testName) {
  return new Promise((resolve) => {
    separator();
    log(`Executando: ${testName}`, 'blue');
    separator();
    
    const fullPath = path.join(__dirname, testPath);
    exec(`node "${fullPath}"`, (error, stdout, stderr) => {
      console.log(stdout);
      
      if (error) {
        log(`${testName} - FALHOU`, 'red');
        resolve({ name: testName, passed: false });
      } else {
        log(`${testName} - PASSOU`, 'green');
        resolve({ name: testName, passed: true });
      }
    });
  });
}

async function runAllTests() {
  console.log('\n');
  separator();
  log('🧪 EXECUTANDO TODOS OS TESTES DA SUPERPET API', 'cyan');
  separator();
  console.log('\n');
  
  const tests = [
    { path: 'auth/auth.test.js', name: 'Auth Module' },
    { path: 'customers/customers.test.js', name: 'Customers Module' },
    { path: 'pets/pets.test.js', name: 'Pets Module' },
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await runTest(test.path, test.name);
    results.push(result);
    console.log('\n\n');
  }
  
  // Resumo Final
  separator();
  log('📊 RESUMO FINAL DE TODOS OS TESTES', 'cyan');
  separator();
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log('');
  log(`Total de módulos testados: ${results.length}`, 'blue');
  log(`Passou: ${passed}`, 'green');
  log(`Falhou: ${failed}`, 'red');
  console.log('');
  
  results.forEach(result => {
    if (result.passed) {
      log(`✓ ${result.name}`, 'green');
    } else {
      log(`✗ ${result.name}`, 'red');
    }
  });
  
  console.log('');
  separator();
  
  if (failed === 0) {
    log('🎉 TODOS OS MÓDULOS PASSARAM EM TODOS OS TESTES!', 'green');
  } else {
    log(`⚠️  ${failed} módulo(s) falharam`, 'yellow');
  }
  
  separator();
  console.log('');
  
  process.exit(failed > 0 ? 1 : 0);
}

// Executar
runAllTests().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});

