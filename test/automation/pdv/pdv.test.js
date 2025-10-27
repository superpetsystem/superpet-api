const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let accessToken = null;
let organizationId = null;
let storeId = null;
let customerId = null;
let productId = null;
let serviceId = null;
let employeeId = null;

async function login() {
  console.log('🔐 Fazendo login...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'superadmin@superpet.com',
      password: 'Super@2024!Admin',
    });
    
    accessToken = response.data.access_token || response.data.accessToken;
    
    // Se SUPER_ADMIN não tem organizationId, buscar uma organização existente
    if (!response.data.user.organizationId) {
      console.log('   🔍 SUPER_ADMIN sem organização, buscando organizações...');
      const orgsResponse = await axios.get(`${BASE_URL}/admin/organizations`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (orgsResponse.data.length > 0) {
        organizationId = orgsResponse.data[0].id;
        console.log(`   ✅ Usando organização: ${organizationId}`);
      } else {
        throw new Error('Nenhuma organização encontrada');
      }
    } else {
      organizationId = response.data.user.organizationId;
    }
    
    console.log(`   ✅ Login realizado - Org: ${organizationId}`);
  } catch (error) {
    console.error('   ❌ Erro no login:', error.response?.data || error.message);
    throw error;
  }
}

async function setup() {
  console.log('🏪 Configurando ambiente de teste...');
  
  try {
    // Usar loja existente da organização
    const storesResponse = await axios.get(`${BASE_URL}/stores`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    const orgStores = storesResponse.data.filter(store => store.organizationId === organizationId);
    if (orgStores.length === 0) {
      throw new Error('Nenhuma loja encontrada para a organização');
    }
    
    storeId = orgStores[0].id;
    console.log(`   ✅ Usando loja existente: ${storeId} (${orgStores[0].name})`);

    // Criar cliente
    const customerResponse = await axios.post(`${BASE_URL}/customers`, {
      name: 'Cliente PDV Test',
      email: `cliente.pdv.${Date.now()}@test.com`,
      phone: '+5511999999999',
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    customerId = customerResponse.data.id;
    console.log(`   ✅ Cliente criado: ${customerId}`);

    // Criar produto
    const productResponse = await axios.post(`${BASE_URL}/products`, {
      code: `PROD_PDV_${Date.now()}`,
      name: 'Produto PDV Test',
      description: 'Produto para teste do PDV',
      category: 'FOOD',
      price: 25.50,
      cost: 15.00,
      unit: 'UN',
      barcode: '1234567890123',
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    productId = productResponse.data.id;
    console.log(`   ✅ Produto criado: ${productId}`);

    // Criar serviço
    const serviceResponse = await axios.post(`${BASE_URL}/services`, {
      code: `SERV_PDV_${Date.now()}`,
      name: 'Serviço PDV Test',
      description: 'Serviço para teste do PDV',
      durationMinutes: 60,
      priceBaseCents: 5000, // R$ 50,00
      resourcesRequired: ['GROOMER'],
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    serviceId = serviceResponse.data.id;
    console.log(`   ✅ Serviço criado: ${serviceId}`);

    // Buscar funcionário
    const employeesResponse = await axios.get(`${BASE_URL}/employees`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (employeesResponse.data.length > 0) {
      employeeId = employeesResponse.data[0].id;
      console.log(`   ✅ Funcionário encontrado: ${employeeId}`);
    }

    console.log('\n✅ Setup completo para testes de PDV');
    console.log(`   • Store ID: ${storeId}`);
    console.log(`   • Customer ID: ${customerId}`);
    console.log(`   • Product ID: ${productId}`);
    console.log(`   • Service ID: ${serviceId}`);
    console.log(`   • Employee ID: ${employeeId}\n`);
  } catch (error) {
    console.error('   ❌ Erro no setup:', error.response?.data || error.message);
    throw error;
  }
}

async function test1_CreateCart() {
  console.log('🧪 Teste 1: Criar carrinho');
  try {
    const response = await axios.post(`${BASE_URL}/pdv/carts`, {
      storeId: storeId,
      customerId: customerId,
      employeeId: employeeId,
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(`   ✅ Carrinho criado: ${response.data.id}`);
    console.log(`   • Status: ${response.data.status}`);
    console.log(`   • Total: R$ ${response.data.totalAmount}`);
    return response.data.id;
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function test2_AddProductToCart(cartId) {
  console.log('🧪 Teste 2: Adicionar produto ao carrinho');
  try {
    const response = await axios.post(`${BASE_URL}/pdv/carts/${cartId}/items`, {
      type: 'PRODUCT',
      productId: productId,
      name: 'Produto PDV Test',
      unitPrice: 25.50,
      quantity: 2,
      discountAmount: 2.00,
      taxAmount: 1.00,
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(`   ✅ Produto adicionado: ${response.data.id}`);
    console.log(`   • Quantidade: ${response.data.quantity}`);
    console.log(`   • Preço unitário: R$ ${response.data.unitPrice}`);
    console.log(`   • Total do item: R$ ${response.data.totalAmount}`);
    return response.data.id;
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function test3_AddServiceToCart(cartId) {
  console.log('🧪 Teste 3: Adicionar serviço ao carrinho');
  try {
    const response = await axios.post(`${BASE_URL}/pdv/carts/${cartId}/items`, {
      type: 'SERVICE',
      serviceId: serviceId,
      name: 'Serviço PDV Test',
      unitPrice: 50.00,
      quantity: 1,
      discountAmount: 5.00,
      taxAmount: 2.50,
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(`   ✅ Serviço adicionado: ${response.data.id}`);
    console.log(`   • Quantidade: ${response.data.quantity}`);
    console.log(`   • Preço unitário: R$ ${response.data.unitPrice}`);
    console.log(`   • Total do item: R$ ${response.data.totalAmount}`);
    return response.data.id;
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function test4_GetCartItems(cartId) {
  console.log('🧪 Teste 4: Listar itens do carrinho');
  try {
    const response = await axios.get(`${BASE_URL}/pdv/carts/${cartId}/items`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(`   ✅ ${response.data.length} itens encontrados`);
    response.data.forEach((item, index) => {
      console.log(`   • Item ${index + 1}: ${item.name} - R$ ${item.totalAmount}`);
    });
    return response.data;
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function test5_GetCartTotals(cartId) {
  console.log('🧪 Teste 5: Calcular totais do carrinho');
  try {
    const response = await axios.get(`${BASE_URL}/pdv/carts/${cartId}/totals`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(`   ✅ Totais calculados:`);
    console.log(`   • Subtotal: R$ ${response.data.subtotal}`);
    console.log(`   • Desconto: R$ ${response.data.discountAmount}`);
    console.log(`   • Impostos: R$ ${response.data.taxAmount}`);
    console.log(`   • Total: R$ ${response.data.totalAmount}`);
    return response.data;
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function test6_UpdateCartItem(cartId, itemId) {
  console.log('🧪 Teste 6: Atualizar item do carrinho');
  try {
    const response = await axios.put(`${BASE_URL}/pdv/carts/${cartId}/items/${itemId}`, {
      quantity: 3,
      discountAmount: 5.00,
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(`   ✅ Item atualizado: ${response.data.id}`);
    console.log(`   • Nova quantidade: ${response.data.quantity}`);
    console.log(`   • Novo desconto: R$ ${response.data.discountAmount}`);
    console.log(`   • Novo total: R$ ${response.data.totalAmount}`);
    return response.data;
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function test7_ProcessPayment(cartId) {
  console.log('🧪 Teste 7: Processar pagamento');
  try {
    const response = await axios.post(`${BASE_URL}/pdv/carts/${cartId}/payment`, {
      amount: 100.00,
      paymentMethod: 'PIX',
      transactionDetails: 'PIX Test Payment',
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(`   ✅ Pagamento processado: ${response.data.id}`);
    console.log(`   • Valor: R$ ${response.data.amount}`);
    console.log(`   • Método: ${response.data.paymentMethod}`);
    console.log(`   • Status: ${response.data.status}`);
    console.log(`   • Número: ${response.data.transactionNumber}`);
    return response.data;
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function test8_GenerateReceipt(cartId) {
  console.log('🧪 Teste 8: Gerar recibo');
  try {
    const response = await axios.post(`${BASE_URL}/pdv/carts/${cartId}/receipt`, {
      notes: 'Recibo de teste do PDV',
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(`   ✅ Recibo gerado: ${response.data.id}`);
    console.log(`   • Número: ${response.data.receiptNumber}`);
    console.log(`   • Tipo: ${response.data.type}`);
    console.log(`   • Total: R$ ${response.data.totalAmount}`);
    console.log(`   • Itens: ${response.data.itemsDetails.length}`);
    return response.data;
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function test9_GetCartTransactions(cartId) {
  console.log('🧪 Teste 9: Listar transações do carrinho');
  try {
    const response = await axios.get(`${BASE_URL}/pdv/carts/${cartId}/transactions`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(`   ✅ ${response.data.length} transações encontradas`);
    response.data.forEach((transaction, index) => {
      console.log(`   • Transação ${index + 1}: ${transaction.transactionNumber} - R$ ${transaction.amount} (${transaction.status})`);
    });
    return response.data;
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function test10_GetCartReceipts(cartId) {
  console.log('🧪 Teste 10: Listar recibos do carrinho');
  try {
    const response = await axios.get(`${BASE_URL}/pdv/carts/${cartId}/receipts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(`   ✅ ${response.data.length} recibos encontrados`);
    response.data.forEach((receipt, index) => {
      console.log(`   • Recibo ${index + 1}: ${receipt.receiptNumber} - R$ ${receipt.totalAmount} (${receipt.type})`);
    });
    return response.data;
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function test11_GetDailySalesSummary() {
  console.log('🧪 Teste 11: Resumo de vendas diárias');
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await axios.get(`${BASE_URL}/pdv/stores/${storeId}/sales/daily?date=${today}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(`   ✅ Resumo de vendas do dia ${today}:`);
    console.log(`   • Total vendido: R$ ${response.data.totalAmount}`);
    console.log(`   • Número de transações: ${response.data.transactionCount}`);
    console.log(`   • Métodos de pagamento:`);
    Object.entries(response.data.paymentMethods).forEach(([method, amount]) => {
      console.log(`     - ${method}: R$ ${amount}`);
    });
    return response.data;
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function test12_SearchCarts() {
  console.log('🧪 Teste 12: Buscar carrinhos');
  try {
    const response = await axios.get(`${BASE_URL}/pdv/carts?storeId=${storeId}&status=COMPLETED`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log(`   ✅ ${response.data.length} carrinhos encontrados`);
    response.data.forEach((cart, index) => {
      console.log(`   • Carrinho ${index + 1}: ${cart.id} - R$ ${cart.totalAmount} (${cart.status})`);
    });
    return response.data;
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando testes automatizados do PDV/Caixa\n');
  
  try {
    await login();
    await setup();
    
    const cartId = await test1_CreateCart();
    const productItemId = await test2_AddProductToCart(cartId);
    const serviceItemId = await test3_AddServiceToCart(cartId);
    await test4_GetCartItems(cartId);
    await test5_GetCartTotals(cartId);
    await test6_UpdateCartItem(cartId, productItemId);
    await test5_GetCartTotals(cartId); // Recalcular após atualização
    await test7_ProcessPayment(cartId);
    await test8_GenerateReceipt(cartId);
    await test9_GetCartTransactions(cartId);
    await test10_GetCartReceipts(cartId);
    await test11_GetDailySalesSummary();
    await test12_SearchCarts();
    
    console.log('\n🎉 Todos os testes do PDV/Caixa passaram com sucesso!');
    console.log('✅ Funcionalidades testadas:');
    console.log('   • Criação de carrinho');
    console.log('   • Adição de produtos e serviços');
    console.log('   • Cálculo de totais');
    console.log('   • Atualização de itens');
    console.log('   • Processamento de pagamento');
    console.log('   • Geração de recibos');
    console.log('   • Consulta de transações');
    console.log('   • Resumo de vendas');
    console.log('   • Busca de carrinhos');
    
  } catch (error) {
    console.error('\n❌ Falha nos testes do PDV/Caixa:', error.message);
    process.exit(1);
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  login,
  setup,
  test1_CreateCart,
  test2_AddProductToCart,
  test3_AddServiceToCart,
  test4_GetCartItems,
  test5_GetCartTotals,
  test6_UpdateCartItem,
  test7_ProcessPayment,
  test8_GenerateReceipt,
  test9_GetCartTransactions,
  test10_GetCartReceipts,
  test11_GetDailySalesSummary,
  test12_SearchCarts,
};
