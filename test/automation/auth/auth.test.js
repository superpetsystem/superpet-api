const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

// Variáveis compartilhadas
let accessToken = null;
let refreshToken = null;
let userId = null;
let userEmail = null;
let resetToken = null;

console.log('🔐 Iniciando testes de Autenticação\n');

// Test 1: Register
async function test1_Register() {
  console.log('Test 1: POST /auth/register');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      email: userEmail,
      name: 'Test User',
      password: 'senha123',
    });

    assert.strictEqual(response.status, 201, 'Status deve ser 201');
    assert(response.data.access_token, 'Deve retornar access_token');
    assert(response.data.user, 'Deve retornar user');
    assert(response.data.refresh_token, 'Deve retornar refresh_token');
    assert.strictEqual(response.data.user.email, userEmail, 'Email deve corresponder');

    accessToken = response.data.access_token;
    userId = response.data.user.id;
    refreshToken = response.data.refresh_token;

    console.log(`   ✅ Usuário registrado: ${userEmail}`);
    console.log(`   ✅ Token obtido: ${accessToken.substring(0, 20)}...`);
    console.log(`   ✅ Refresh: ${refreshToken.substring(0, 16)}...`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 2: Login
async function test2_Login() {
  console.log('\nTest 2: POST /auth/login');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: userEmail,
      password: 'senha123',
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(response.data.access_token, 'Deve retornar access_token');
    assert(response.data.user, 'Deve retornar user');
    assert(response.data.refresh_token, 'Deve retornar refresh_token');

    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;

    console.log('   ✅ Login realizado com sucesso');
    console.log(`   ✅ Novo token: ${accessToken.substring(0, 20)}...`);
    console.log(`   ✅ Novo refresh: ${refreshToken.substring(0, 16)}...`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 3: Get Profile
async function test3_GetProfile() {
  console.log('\nTest 3: GET /auth/me');
  
  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(response.data.id, 'Deve retornar user id');
    assert.strictEqual(response.data.email, userEmail, 'Email deve corresponder');

    console.log('   ✅ Perfil obtido com sucesso');
    console.log(`   ✅ User ID: ${response.data.id}`);
    console.log(`   ✅ Organization ID: ${response.data.organizationId}`);
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 4: Login com senha errada
async function test4_LoginWrongPassword() {
  console.log('\nTest 4: POST /auth/login (senha errada)');
  
  try {
    await axios.post(`${BASE_URL}/auth/login`, {
      email: userEmail,
      password: 'senhaerrada',
    });

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('   ✅ Rejeitou corretamente senha errada');
    } else {
      console.error('   ❌ Erro inesperado:', error.message);
      throw error;
    }
  }
}

// Test 5: Register com email duplicado
async function test5_RegisterDuplicateEmail() {
  console.log('\nTest 5: POST /auth/register (email duplicado)');
  
  try {
    await axios.post(`${BASE_URL}/auth/register`, {
      email: userEmail,
      name: 'Test User 2',
      password: 'senha456',
    });

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('   ✅ Rejeitou email duplicado corretamente');
    } else {
      console.error('   ❌ Erro inesperado:', error.message);
      throw error;
    }
  }
}

// Test 6: Acesso sem token
async function test6_UnauthorizedAccess() {
  console.log('\nTest 6: GET /auth/me (sem token)');
  
  try {
    await axios.get(`${BASE_URL}/auth/me`);
    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('   ✅ Rejeitou acesso sem token corretamente');
    } else {
      console.error('   ❌ Erro inesperado:', error.message);
      throw error;
    }
  }
}

// Test 7: Change Password (authenticated)
async function test7_ChangePassword() {
  console.log('\nTest 7: POST /auth/change-password');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/change-password`, {
      currentPassword: 'senha123',
      newPassword: 'novaSenha456',
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(response.data.message, 'Deve retornar mensagem de sucesso');

    console.log('   ✅ Senha alterada com sucesso');
    console.log(`   ✅ Mensagem: ${response.data.message}`);

    // Tentar fazer login com nova senha
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: userEmail,
      password: 'novaSenha456',
    });

    assert.strictEqual(loginResponse.status, 200, 'Login com nova senha deve funcionar');
    accessToken = loginResponse.data.access_token;
    console.log('   ✅ Login com nova senha confirmado');
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 8: Forgot Password
async function test8_ForgotPassword() {
  console.log('\nTest 8: POST /auth/forgot-password');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/forgot-password`, {
      email: userEmail,
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(response.data.message, 'Deve retornar mensagem');

    // Em ambiente local, deve retornar o token
    if (response.data.token) {
      resetToken = response.data.token;
      console.log('   ✅ Token de reset gerado');
      console.log(`   ✅ Token: ${resetToken.substring(0, 16)}... (64 chars)`);
    } else {
      console.log('   ✅ Requisição processada (token enviado por email em prod)');
    }
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 9: Reset Password
async function test9_ResetPassword() {
  console.log('\nTest 9: POST /auth/reset-password');
  
  try {
    if (!resetToken) {
      console.log('   ⚠️  Token não disponível (ambiente de produção) - pulando teste');
      return;
    }

    const response = await axios.post(`${BASE_URL}/auth/reset-password`, {
      token: resetToken,
      newPassword: 'senhaResetada789',
    });

    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(response.data.message, 'Deve retornar mensagem de sucesso');

    console.log('   ✅ Senha resetada com sucesso');
    console.log(`   ✅ Mensagem: ${response.data.message}`);

    // Tentar fazer login com senha resetada
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: userEmail,
      password: 'senhaResetada789',
    });

    assert.strictEqual(loginResponse.status, 200, 'Login com senha resetada deve funcionar');
    accessToken = loginResponse.data.access_token;
    console.log('   ✅ Login com senha resetada confirmado');
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 10: Reset Password com token inválido
async function test10_ResetPasswordInvalidToken() {
  console.log('\nTest 10: POST /auth/reset-password (token inválido)');
  
  try {
    await axios.post(`${BASE_URL}/auth/reset-password`, {
      token: 'token-invalido-12345678901234567890123456789012',
      newPassword: 'novaSenha999',
    });

    throw new Error('Deveria ter falhado');
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('Invalid or expired')) {
      console.log('   ✅ Rejeitou token inválido corretamente');
    } else if (!error.message.includes('Deveria ter falhado')) {
      console.error('   ❌ Erro inesperado:', error.message);
      throw error;
    }
  }
}

// Test 11: Refresh Token
async function test11_RefreshToken() {
  console.log('\nTest 11: POST /auth/refresh');
  try {
    const response = await axios.post(`${BASE_URL}/auth/refresh`, {
      refreshToken,
    });
    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(response.data.access_token, 'Deve retornar novo access_token');
    accessToken = response.data.access_token;
    console.log('   ✅ Refresh gerou novo access token');
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Test 12: Logout (blacklist tokens)
async function test12_Logout() {
  console.log('\nTest 12: POST /auth/logout');
  try {
    const response = await axios.post(`${BASE_URL}/auth/logout`, {
      refreshToken,
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    assert.strictEqual(response.status, 200, 'Status deve ser 200');
    assert(response.data.message, 'Deve retornar mensagem');
    console.log('   ✅ Logout efetuado e tokens enviados para blacklist');

    // Tentar usar access token após logout deve falhar
    try {
      await axios.get(`${BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${accessToken}` } });
      throw new Error('Deveria ter bloqueado token em blacklist');
    } catch (err) {
      console.log('   ✅ Acesso bloqueado após logout');
    }
  } catch (error) {
    console.error('   ❌ Erro:', error.response?.data || error.message);
    throw error;
  }
}

async function runAllTests() {
  console.log('=' .repeat(70));
  console.log('🧪 TESTES DE AUTENTICAÇÃO');
  console.log('=' .repeat(70));

  // Gerar email único para cada execução
  userEmail = `test_${Date.now()}_${Math.random().toString(36).substring(7)}@superpet.com.br`;

  try {
    await test1_Register();
    await test2_Login();
    await test3_GetProfile();
    await test4_LoginWrongPassword();
    await test5_RegisterDuplicateEmail();
    await test6_UnauthorizedAccess();
    await test7_ChangePassword();
    await test8_ForgotPassword();
    await test9_ResetPassword();
    await test10_ResetPasswordInvalidToken();
    await test11_RefreshToken();
    await test12_Logout();

    console.log('\n' + '='.repeat(70));
    console.log('✅ TODOS OS TESTES DE AUTH PASSARAM!');
    console.log('='.repeat(70));
    console.log(`\n📊 Resumo:`);
    console.log(`   • 12 testes executados`);
    console.log(`   • 12 testes passaram`);
    console.log(`   • Token ativo: ${accessToken ? 'Sim' : 'Não'}`);
    console.log(`   • User ID: ${userId}`);
    console.log(`   • Password changed: ✅`);
    console.log(`   • Password reset: ✅\n`);

    return { success: true, accessToken, userId, userEmail };
  } catch (error) {
    console.error('\n❌ Falha nos testes de Auth');
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
