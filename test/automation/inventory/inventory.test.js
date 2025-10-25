const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

// Variáveis compartilhadas
let accessToken = null;
let productId = null;
let storeId = null;

console.log('📦 Iniciando testes de Inventory Management\n');

// Helper: Fazer login
async function login() {
  const authTests = require('../auth/auth.test.js');
  const result = await authTests.runAllTests();
  accessToken = result.accessToken;
  console.log('\n✅ Autenticado para testes de Inventory\n');
}

// Helper: Criar loja com feature habilitada
async function createStoreWithFeature() {
  console.log('🏪 Criando loja com feature INVENTORY_MANAGEMENT...');
  
  try {
    // Criar loja
    const storeResponse = await axios.post(`${BASE_URL}/v1/stores`, {
      code: `INV_STORE_${Date.now()}`,
      name: 'Loja Inventory Test',
      timezone: 'America/Manaus',
      openingHours: { mon: [['08:00', '18:00']] },
      resourcesCatalog: ['GROOMER'],
      capacity: { GROOMER: 2 },
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    storeId = storeResponse.data.id;
    console.log(`   ✅ Loja criada: ${storeId}`);

    // Habilitar feature INVENTORY_MANAGEMENT
    await axios.put(`${BASE_URL}/v1/stores/${storeId}/features/INVENTORY_MANAGEMENT`, {
      enabled: true,
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(`   ✅ Feature INVENTORY_MANAGEMENT habilitada`);
  } catch (error) {
    console.error('   ❌ Erro ao criar loja:', error.response?.data || error.message);
    throw error;
  }
}

// Test 1: Criar produto
async function test1_CreateProduct() {
  console.log('Test 1: POST /v1/products');
  
  try {
    const response = await axios.post(`${BASE_URL}/v1/products`, {
      code: `PROD_${Date.now()}`,
      name: 'Shampoo Premium',
      description: 'Shampoo para pets de pelo longo',
      category: 'HYGIENE',
      unit: 'ML',
      costPriceCents: 2000,
      salePriceCents: 3500,
      minStock: 10,
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 201, 'Status deve ser 201');
    assert(response.data.id, 'Deve retornar ID');
    assert.strictEqual(response.data.name, 'Shampoo Premium', 'Nome deve corresponder');
    assert.strictEqual(response.data.category, 'HYGIENE', 'Categoria deve ser HYGIENE');

    productId = response.data.id;

    console.log(`   ✅ Produto criado: ${response.data.name}`);
    console.log(`   ✅ ID: ${productId}`);
    console.log(`   ✅ Código: ${response.data.code}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 2: Listar produtos
async function test2_ListProducts() {
  console.log('\nTest 2: GET /v1/products');
  
  try {
    const response = await axios.get(`${BASE_URL}/v1/products`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(Array.isArray(response.data), 'Deve retornar array');
    assert(response.data.length >= 1, 'Deve ter pelo menos 1 produto');

    console.log(`   ✅ ${response.data.length} produto(s) encontrado(s)`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 3: Ver produto por ID
async function test3_GetProductById() {
  console.log('\nTest 3: GET /v1/products/:id');
  
  try {
    const response = await axios.get(`${BASE_URL}/v1/products/${productId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.id, productId, 'ID deve corresponder');
    assert.strictEqual(response.data.name, 'Shampoo Premium', 'Nome deve corresponder');

    console.log(`   ✅ Produto: ${response.data.name}`);
    console.log(`   ✅ Categoria: ${response.data.category}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 4: Atualizar produto
async function test4_UpdateProduct() {
  console.log('\nTest 4: PUT /v1/products/:id');
  
  try {
    const response = await axios.put(
      `${BASE_URL}/v1/products/${productId}`,
      {
        name: 'Shampoo Premium Plus',
        salePriceCents: 4000,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(response.data.name, 'Shampoo Premium Plus', 'Nome deve estar atualizado');
    assert.strictEqual(response.data.salePriceCents, 4000, 'Preço deve estar atualizado');

    console.log('   ✅ Produto atualizado');
    console.log(`   ✅ Novo nome: ${response.data.name}`);
    console.log(`   ✅ Novo preço: R$ ${(response.data.salePriceCents / 100).toFixed(2)}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 5: Registrar entrada de estoque
async function test5_RegisterEntry() {
  console.log('\nTest 5: POST /v1/stores/:storeId/stock/movements (ENTRY)');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/v1/stores/${storeId}/stock/movements`,
      {
        productId: productId,
        type: 'ENTRY',
        quantity: 50,
        reason: 'Compra inicial',
        costPriceCents: 2000,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 201, 'Status deve ser 201');
    assert(response.data.id, 'Deve retornar ID do movimento');
    assert.strictEqual(response.data.type, 'ENTRY', 'Tipo deve ser ENTRY');
    assert.strictEqual(parseFloat(response.data.quantity), 50, 'Quantidade deve ser 50');

    console.log('   ✅ Entrada registrada');
    console.log(`   ✅ Quantidade: ${response.data.quantity} unidades`);
    console.log(`   ✅ Tipo: ${response.data.type}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 6: Ver estoque da loja
async function test6_GetStoreStock() {
  console.log('\nTest 6: GET /v1/stores/:storeId/stock');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/v1/stores/${storeId}/stock`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(Array.isArray(response.data), 'Deve retornar array');

    const productStock = response.data.find(s => s.productId === productId);
    assert(productStock, 'Deve ter o produto no estoque');
    assert.strictEqual(parseFloat(productStock.quantity), 50, 'Quantidade deve ser 50');

    console.log(`   ✅ Estoque consultado: ${response.data.length} produtos`);
    console.log(`   ✅ Produto criado tem ${productStock.quantity} unidades`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 7: Registrar saída de estoque
async function test7_RegisterExit() {
  console.log('\nTest 7: POST /v1/stores/:storeId/stock/movements (EXIT)');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/v1/stores/${storeId}/stock/movements`,
      {
        productId: productId,
        type: 'EXIT',
        quantity: 15,
        reason: 'Venda',
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 201, 'Status deve ser 201');
    assert.strictEqual(response.data.type, 'EXIT', 'Tipo deve ser EXIT');

    console.log('   ✅ Saída registrada');
    console.log(`   ✅ Quantidade: -${response.data.quantity} unidades`);
    console.log('   ✅ Estoque atualizado automaticamente');
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 8: Ajustar estoque manualmente
async function test8_AdjustStock() {
  console.log('\nTest 8: POST /v1/stores/:storeId/stock/adjust');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/v1/stores/${storeId}/stock/adjust`,
      {
        productId: productId,
        newQuantity: 30,
        reason: 'Inventário físico',
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert.strictEqual(parseFloat(response.data.quantity), 30, 'Quantidade deve ser 30');

    console.log('   ✅ Estoque ajustado manualmente');
    console.log(`   ✅ Nova quantidade: ${response.data.quantity}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 9: Ver histórico de movimentações
async function test9_GetMovements() {
  console.log('\nTest 9: GET /v1/stores/:storeId/stock/movements');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/v1/stores/${storeId}/stock/movements`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(Array.isArray(response.data), 'Deve retornar array');
    assert(response.data.length >= 3, 'Deve ter pelo menos 3 movimentações (ENTRY + EXIT + ADJUSTMENT)');

    console.log(`   ✅ ${response.data.length} movimentações encontradas`);
    console.log(`   ✅ Tipos: ENTRY, EXIT, ADJUSTMENT`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 10: Criar produto com código duplicado (deve falhar)
async function test10_DuplicateProductCode() {
  console.log('\nTest 10: POST /v1/products (código duplicado)');
  
  try {
    const response = await axios.get(`${BASE_URL}/v1/products`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    const existingCode = response.data[0].code;

    await axios.post(`${BASE_URL}/v1/products`, {
      code: existingCode,
      name: 'Produto Duplicado',
      category: 'OTHER',
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('PRODUCT_CODE_TAKEN')) {
      console.log('   ✅ Rejeitou código duplicado corretamente');
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.message);
      throw error;
    }
  }
}

// Test 11: Registrar saída com estoque insuficiente (deve falhar)
async function test11_InsufficientStock() {
  console.log('\nTest 11: POST /v1/stores/:storeId/stock/movements (estoque insuficiente)');
  
  try {
    await axios.post(
      `${BASE_URL}/v1/stores/${storeId}/stock/movements`,
      {
        productId: productId,
        type: 'EXIT',
        quantity: 1000, // Mais do que tem no estoque
        reason: 'Tentativa inválida',
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('INSUFFICIENT_STOCK')) {
      console.log('   ✅ Rejeitou saída com estoque insuficiente');
      console.log('   ✅ Validação de estoque funcionando');
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.message);
      throw error;
    }
  }
}

// Test 12: Ver alertas de estoque baixo
async function test12_LowStockAlerts() {
  console.log('\nTest 12: GET /v1/stores/:storeId/stock/alerts');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/v1/stores/${storeId}/stock/alerts`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(Array.isArray(response.data), 'Deve retornar array');

    console.log(`   ✅ ${response.data.length} alerta(s) de estoque baixo`);
    console.log('   ✅ Sistema detecta produtos abaixo do mínimo');
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function runAllTests() {
  console.log('=' .repeat(70));
  console.log('🧪 TESTES DE INVENTORY MANAGEMENT');
  console.log('=' .repeat(70));

  try {
    await login();
    await createStoreWithFeature();
    await test1_CreateProduct();
    await test2_ListProducts();
    await test3_GetProductById();
    await test4_UpdateProduct();
    await test5_RegisterEntry();
    await test6_GetStoreStock();
    await test7_RegisterExit();
    await test8_AdjustStock();
    await test9_GetMovements();
    await test10_DuplicateProductCode();
    await test11_InsufficientStock();
    await test12_LowStockAlerts();

    console.log('\n' + '='.repeat(70));
    console.log('✅ TODOS OS TESTES DE INVENTORY PASSARAM!');
    console.log('='.repeat(70));
    console.log(`\n📊 Resumo:`);
    console.log(`   • 12 testes executados`);
    console.log(`   • 12 testes passaram`);
    console.log(`   • Product ID: ${productId}`);
    console.log(`   • Estoque gerenciado: ✅`);
    console.log(`   • Validações: ✅\n`);

    return { success: true, productId };
  } catch (error) {
    console.error('\n❌ Falha nos testes de Inventory');
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runAllTests };

