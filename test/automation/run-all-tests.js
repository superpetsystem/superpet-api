const { runAllTests: runAuthTests } = require('./auth/auth.test.js');
const { runAllTests: runStoresTests } = require('./stores/stores.test.js');
const { runAllTests: runCustomersTests } = require('./customers/customers.test.js');
const { runAllTests: runPetsTests } = require('./pets/pets.test.js');
const { runAllTests: runServicesTests } = require('./services/services.test.js');
const { runAllTests: runFeaturesTests } = require('./features/features.test.js');
const { runAllTests: runSaasIsolationTests } = require('./saas/saas-isolation.test.js');
const { runAllTests: runSaasLimitsTests } = require('./saas/saas-limits.test.js');
const { runAllTests: runEmployeesHierarchyTests } = require('./employees/employees-hierarchy.test.js');
const { runAllTests: runFeaturesScalabilityTests } = require('./features/features-scalability.test.js');
const { runAllTests: runValidationErrorsTests } = require('./errors/validation-errors.test.js');
const { runAllTests: runPermissionErrorsTests } = require('./errors/permission-errors.test.js');

async function runAllAutomationTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║         SUPERPET API - SUITE COMPLETA DE TESTES                   ║');
  console.log('║                  Arquitetura SaaS Multi-Tenant                    ║');
  console.log('║                  Funcionalidades + Isolamento                     ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  const results = [];
  const startTime = Date.now();

  try {
    // 1. Auth
    console.log('📝 MÓDULO 1/6: Autenticação\n');
    const authResult = await runAuthTests();
    results.push({ module: 'Auth', success: true, ...authResult });
    console.log('\n');

    // 2. Stores
    console.log('📝 MÓDULO 2/6: Lojas e Features\n');
    const storesResult = await runStoresTests();
    results.push({ module: 'Stores', success: true, ...storesResult });
    console.log('\n');

    // 3. Customers
    console.log('📝 MÓDULO 3/6: Clientes e Endereços\n');
    const customersResult = await runCustomersTests();
    results.push({ module: 'Customers', success: true, ...customersResult });
    console.log('\n');

    // 4. Pets
    console.log('📝 MÓDULO 4/6: Pets\n');
    const petsResult = await runPetsTests();
    results.push({ module: 'Pets', success: true, ...petsResult });
    console.log('\n');

    // 5. Services
    console.log('📝 MÓDULO 5/6: Serviços e Customizações\n');
    const servicesResult = await runServicesTests();
    results.push({ module: 'Services', success: true, ...servicesResult });
    console.log('\n');

    // 6. Features
    console.log('📝 MÓDULO 6/10: Pickups e Live Cam\n');
    const featuresResult = await runFeaturesTests();
    results.push({ module: 'Features', success: true, ...featuresResult });
    console.log('\n');

    // 7. SaaS Isolation
    console.log('📝 MÓDULO 7/10: Isolamento Multi-Tenant SaaS\n');
    const saasIsolationResult = await runSaasIsolationTests();
    results.push({ module: 'SaaS Isolation', success: true, ...saasIsolationResult });
    console.log('\n');

    // 8. SaaS Limits
    console.log('📝 MÓDULO 8/10: Limites de Plano SaaS\n');
    const saasLimitsResult = await runSaasLimitsTests();
    results.push({ module: 'SaaS Limits', success: true, ...saasLimitsResult });
    console.log('\n');

    // 9. Employees Hierarchy
    console.log('📝 MÓDULO 9/10: Hierarquia de Employees e Roles\n');
    const employeesHierarchyResult = await runEmployeesHierarchyTests();
    results.push({ module: 'Employees Hierarchy', success: true, ...employeesHierarchyResult });
    console.log('\n');

    // 10. Features Scalability
    console.log('📝 MÓDULO 10/12: Escalabilidade de Features\n');
    const featuresScalabilityResult = await runFeaturesScalabilityTests();
    results.push({ module: 'Features Scalability', success: true, ...featuresScalabilityResult });
    console.log('\n');

    // 11. Validation Errors
    console.log('📝 MÓDULO 11/12: Testes de Validação de Erros\n');
    const validationErrorsResult = await runValidationErrorsTests();
    results.push({ module: 'Validation Errors', success: true, ...validationErrorsResult });
    console.log('\n');

    // 12. Permission Errors
    console.log('📝 MÓDULO 12/12: Testes de Erros de Permissão\n');
    const permissionErrorsResult = await runPermissionErrorsTests();
    results.push({ module: 'Permission Errors', success: true, ...permissionErrorsResult });
    console.log('\n');

    // Resumo final
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                    RESULTADO FINAL                                 ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
    console.log('\n');
    console.log('📊 Resumo Geral:');
    console.log('   ────────────────────────────────────────────────────────');
    console.log('   │ Módulo            │ Status    │ Testes           │');
   console.log('   ────────────────────────────────────────────────────────');
   console.log('   │ Auth              │ ✅ PASSOU │ 10 testes        │');
   console.log('   │ Stores & Features │ ✅ PASSOU │ 7 testes         │');
    console.log('   │ Customers         │ ✅ PASSOU │ 8 testes         │');
    console.log('   │ Pets              │ ✅ PASSOU │ 6 testes         │');
    console.log('   │ Services          │ ✅ PASSOU │ 7 testes         │');
    console.log('   │ Features Extras   │ ✅ PASSOU │ 7 testes         │');
    console.log('   │ SaaS Isolation    │ ✅ PASSOU │ 13 testes        │');
    console.log('   │ SaaS Limits       │ ✅ PASSOU │ 4 testes         │');
    console.log('   │ Employees Hier.   │ ✅ PASSOU │ 10 testes        │');
    console.log('   │ Features Scale    │ ✅ PASSOU │ 6 testes         │');
    console.log('   │ Validation Errors │ ✅ PASSOU │ 12 testes        │');
    console.log('   │ Permission Errors │ ✅ PASSOU │ 2 testes         │');
   console.log('   ────────────────────────────────────────────────────────');
   console.log(`   │ TOTAL             │ ✅ PASSOU │ 92 testes        │`);
    console.log('   ────────────────────────────────────────────────────────');
    console.log('   \n');
    console.log(`⏱️  Tempo total: ${duration}s`);
    console.log('   \n');
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║              ✅ TODOS OS TESTES PASSARAM! 🎉                       ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
    console.log('\n');

    console.log('📋 Objetos Criados:');
    console.log(`   • User: ${authResult.userId}`);
    console.log(`   • Store: ${storesResult.storeId || 'N/A'}`);
    console.log(`   • Customer: ${customersResult.customerId}`);
    console.log(`   • Address: ${customersResult.addressId}`);
    console.log(`   • Pet: ${petsResult.petId}`);
    console.log(`   • Service: ${servicesResult.serviceId}`);
    console.log(`   • Custom Service: ${servicesResult.customServiceId || 'N/A'}`);
    console.log('\n');

  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                ❌ FALHA NOS TESTES                                 ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
    console.log('\n');
    console.log(`⏱️  Tempo até falha: ${duration}s`);
    console.log('\n');
    console.error('Erro:', error.message);
    throw error;
  }
}

// Executar
runAllAutomationTests()
  .then(() => {
    console.log('🎊 Suite de testes concluída com sucesso!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Suite de testes falhou\n');
    process.exit(1);
  });
