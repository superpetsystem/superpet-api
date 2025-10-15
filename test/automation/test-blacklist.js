/**
 * 🧪 Teste Específico - Token Blacklist
 * 
 * Este teste valida que após logout, o access token
 * é IMEDIATAMENTE invalidado (não funciona mais)
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testBlacklist() {
  console.log('\n🧪 TESTANDO TOKEN BLACKLIST\n');
  console.log('=' .repeat(80));
  
  try {
    // 1. Registrar usuário
    console.log('\n1️⃣  Registrando usuário...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: `blacklist${Date.now()}@test.com`,
      password: 'senha123',
      name: 'Test Blacklist'
    });
    
    const { accessToken, user } = registerResponse.data;
    console.log(`✅ Usuário registrado: ${user.email}`);
    console.log(`   Token: ${accessToken.substring(0, 30)}...`);
    
    // 2. Testar que token funciona ANTES do logout
    console.log('\n2️⃣  Testando token ANTES do logout...');
    const profileBefore = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log(`✅ Token VÁLIDO - Perfil retornado: ${profileBefore.data.email}`);
    
    // 3. Fazer logout
    console.log('\n3️⃣  Fazendo logout...');
    await axios.post(`${BASE_URL}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log(`✅ Logout realizado`);
    
    // 4. Tentar usar o mesmo token DEPOIS do logout
    console.log('\n4️⃣  Testando token DEPOIS do logout...');
    try {
      await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      // Se chegou aqui, FALHOU!
      console.log('❌ FALHOU: Token ainda está válido após logout!');
      console.log('   O token deveria estar na blacklist!');
      return false;
      
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log(`✅ Token INVALIDADO - Erro: ${error.response.data.message}`);
        console.log(`   Status: 401 Unauthorized ✅`);
        console.log(`\n🎉 SUCCESS: Token foi adicionado à blacklist corretamente!`);
        return true;
      } else {
        console.log(`❌ Erro inesperado: ${error.message}`);
        return false;
      }
    }
    
  } catch (error) {
    console.log(`\n❌ ERRO NO TESTE:`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data: ${JSON.stringify(error.response.data)}`);
    } else {
      console.log(`   ${error.message}`);
    }
    return false;
  }
}

// Executar
(async () => {
  const success = await testBlacklist();
  console.log('\n' + '='.repeat(80));
  
  if (success) {
    console.log('\n✅ TESTE DE BLACKLIST PASSOU!\n');
    process.exit(0);
  } else {
    console.log('\n❌ TESTE DE BLACKLIST FALHOU!\n');
    process.exit(1);
  }
})();

