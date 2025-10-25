const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let accessToken = null;
let organizationId = null;
let storeId = null;

// Helper para headers padrão
function getHeaders() {
  return {
    Authorization: `Bearer ${accessToken}`,
    'X-Org-Id': organizationId,
  };
}

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
        headers: getHeaders(),
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
      headers: getHeaders(),
    });
    
    const orgStores = storesResponse.data.filter(store => store.organizationId === organizationId);
    if (orgStores.length === 0) {
      throw new Error('Nenhuma loja encontrada para a organização');
    }
    
    storeId = orgStores[0].id;
    console.log(`   ✅ Usando loja existente: ${storeId} (${orgStores[0].name})`);

    console.log('\n✅ Setup completo para testes de PDV');
    console.log(`   • Store ID: ${storeId}`);
    console.log(`   • Organization ID: ${organizationId}\n`);
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
    }, {
      headers: getHeaders(),
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

async function test2_GetCart(cartId) {
  console.log('🧪 Teste 2: Buscar carrinho');
  try {
    const response = await axios.get(`${BASE_URL}/pdv/carts/${cartId}`, {
      headers: getHeaders(),
    });

    console.log(`   ✅ Carrinho encontrado: ${response.data.id}`);
    console.log(`   • Status: ${response.data.status}`);
    console.log(`   • Loja: ${response.data.storeId}`);
    console.log(`   • Total: R$ ${response.data.totalAmount}`);
    return response.data;
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function test3_GetCartItems(cartId) {
  console.log('🧪 Teste 3: Listar itens do carrinho');
  try {
    const response = await axios.get(`${BASE_URL}/pdv/carts/${cartId}/items`, {
      headers: getHeaders(),
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

async function test4_GetCartTotals(cartId) {
  console.log('🧪 Teste 4: Calcular totais do carrinho');
  try {
    const response = await axios.get(`${BASE_URL}/pdv/carts/${cartId}/totals`, {
      headers: getHeaders(),
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

async function test5_UpdateCartStatus(cartId) {
  console.log('🧪 Teste 5: Atualizar status do carrinho');
  try {
    const response = await axios.patch(`${BASE_URL}/pdv/carts/${cartId}/status`, {
      status: 'COMPLETED',
    }, {
      headers: getHeaders(),
    });

    console.log(`   ✅ Status atualizado: ${response.data.status}`);
    console.log(`   • Novo status: ${response.data.status}`);
    return response.data;
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function test6_ListCartsByStore() {
  console.log('🧪 Teste 6: Listar carrinhos por loja');
  try {
    const response = await axios.get(`${BASE_URL}/pdv/stores/${storeId}/carts`, {
      headers: getHeaders(),
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

async function test7_SearchCarts() {
  console.log('🧪 Teste 7: Buscar carrinhos');
  try {
    const response = await axios.get(`${BASE_URL}/pdv/carts?storeId=${storeId}`, {
      headers: getHeaders(),
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
    await test2_GetCart(cartId);
    await test3_GetCartItems(cartId);
    await test4_GetCartTotals(cartId);
    await test5_UpdateCartStatus(cartId);
    await test6_ListCartsByStore();
    await test7_SearchCarts();
    
    console.log('\n🎉 Todos os testes do PDV/Caixa passaram com sucesso!');
    console.log('✅ Funcionalidades testadas:');
    console.log('   • Criação de carrinho');
    console.log('   • Busca de carrinho');
    console.log('   • Listagem de itens');
    console.log('   • Cálculo de totais');
    console.log('   • Atualização de status');
    console.log('   • Listagem por loja');
    console.log('   • Busca avançada');
    
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
  test2_GetCart,
  test3_GetCartItems,
  test4_GetCartTotals,
  test5_UpdateCartStatus,
  test6_ListCartsByStore,
  test7_SearchCarts,
};
