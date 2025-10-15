/**
 * 🧪 Testes de Automação - Módulo de Autenticação
 * SuperPet API
 * 
 * Este script testa todos os endpoints do módulo de Auth
 * 
 * Como executar:
 * node test/automation/auth.test.js
 */

const axios = require('axios');

// ========================================
// CONFIGURAÇÕES
// ========================================

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: `teste${Date.now()}@superpet.com`, // Email único para cada execução
  password: 'senha123',
  name: 'Usuário Teste Automação'
};

// Variáveis globais para armazenar tokens
let accessToken = '';
let refreshToken = '';
let userId = '';
let resetToken = '';

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function log(message, color = 'reset') {
  // Símbolos em vez de cores para melhor compatibilidade Windows
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

function logSuccess(test) {
  console.log(`✅ PASSOU: ${test}`);
}

function logError(test, error) {
  console.log(`❌ FALHOU: ${test}`);
  if (error.response) {
    console.log(`   Status: ${error.response.status}`);
    console.log(`   Message: ${JSON.stringify(error.response.data)}`);
  } else {
    console.log(`   Error: ${error.message}`);
  }
}

function logInfo(message) {
  console.log(`   ${message}`);
}

function logWarning(message) {
  console.log(`⚠️  ${message}`);
}

function separator() {
  console.log('='.repeat(80));
}

// ========================================
// TESTES
// ========================================

async function test1_Register() {
  separator();
  log('TEST 1: POST /auth/register - Registrar novo usuário', 'blue');
  separator();
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, TEST_USER);
    
    // Validações
    if (response.status !== 201) {
      throw new Error(`Status esperado: 201, recebido: ${response.status}`);
    }
    
    if (!response.data.accessToken) {
      throw new Error('accessToken não retornado');
    }
    
    if (!response.data.refreshToken) {
      throw new Error('refreshToken não retornado');
    }
    
    if (!response.data.user) {
      throw new Error('user não retornado');
    }
    
    if (response.data.user.email !== TEST_USER.email) {
      throw new Error('Email do usuário incorreto');
    }
    
    // Salvar tokens
    accessToken = response.data.accessToken;
    refreshToken = response.data.refreshToken;
    userId = response.data.user.id;
    
    logSuccess('Registro de usuário');
    logInfo(`   User ID: ${userId}`);
    logInfo(`   Email: ${response.data.user.email}`);
    logInfo(`   Name: ${response.data.user.name}`);
    logInfo(`   Access Token: ${accessToken.substring(0, 20)}...`);
    
    return true;
  } catch (error) {
    logError('Registro de usuário', error);
    return false;
  }
}

async function test2_Login() {
  separator();
  log('TEST 2: POST /auth/login - Fazer login', 'blue');
  separator();
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }
    
    if (!response.data.accessToken) {
      throw new Error('accessToken não retornado');
    }
    
    // Atualizar tokens
    accessToken = response.data.accessToken;
    refreshToken = response.data.refreshToken;
    
    logSuccess('Login');
    logInfo(`   Access Token atualizado: ${accessToken.substring(0, 20)}...`);
    
    return true;
  } catch (error) {
    logError('Login', error);
    return false;
  }
}

async function test3_GetProfile() {
  separator();
  log('TEST 3: GET /auth/me - Obter perfil do usuário', 'blue');
  separator();
  
  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }
    
    if (!response.data.id) {
      throw new Error('ID do usuário não retornado');
    }
    
    if (response.data.email !== TEST_USER.email) {
      throw new Error('Email incorreto');
    }
    
    logSuccess('Obter perfil');
    logInfo(`   ID: ${response.data.id}`);
    logInfo(`   Email: ${response.data.email}`);
    logInfo(`   Name: ${response.data.name}`);
    logInfo(`   Created At: ${response.data.createdAt}`);
    
    return true;
  } catch (error) {
    logError('Obter perfil', error);
    return false;
  }
}

async function test4_ChangePassword() {
  separator();
  log('TEST 4: PATCH /auth/change-password - Trocar senha', 'blue');
  separator();
  
  try {
    const newPassword = 'novaSenha456';
    
    const response = await axios.patch(
      `${BASE_URL}/auth/change-password`,
      {
        currentPassword: TEST_USER.password,
        newPassword: newPassword
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    
    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }
    
    if (response.data.message !== 'Password changed successfully') {
      throw new Error('Mensagem de sucesso não retornada');
    }
    
    // Atualizar senha do usuário de teste
    TEST_USER.password = newPassword;
    
    logSuccess('Trocar senha');
    logInfo(`   Senha alterada de "senha123" para "${newPassword}"`);
    
    return true;
  } catch (error) {
    logError('Trocar senha', error);
    return false;
  }
}

async function test5_LoginWithNewPassword() {
  separator();
  log('TEST 5: POST /auth/login - Login com nova senha', 'blue');
  separator();
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }
    
    // Atualizar tokens
    accessToken = response.data.accessToken;
    refreshToken = response.data.refreshToken;
    
    logSuccess('Login com nova senha');
    logInfo(`   Login bem-sucedido com senha atualizada`);
    
    return true;
  } catch (error) {
    logError('Login com nova senha', error);
    return false;
  }
}

async function test6_RefreshToken() {
  separator();
  log('TEST 6: POST /auth/refresh - Renovar tokens', 'blue');
  separator();
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/refresh`, {
      refreshToken: refreshToken
    });
    
    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }
    
    if (!response.data.accessToken) {
      throw new Error('Novo accessToken não retornado');
    }
    
    if (!response.data.refreshToken) {
      throw new Error('Novo refreshToken não retornado');
    }
    
    const oldAccessToken = accessToken.substring(0, 20);
    const newAccessToken = response.data.accessToken.substring(0, 20);
    
    // Atualizar tokens
    accessToken = response.data.accessToken;
    refreshToken = response.data.refreshToken;
    
    logSuccess('Renovar tokens');
    logInfo(`   Access Token antigo: ${oldAccessToken}...`);
    logInfo(`   Access Token novo: ${newAccessToken}...`);
    
    return true;
  } catch (error) {
    logError('Renovar tokens', error);
    return false;
  }
}

async function test7_ForgotPassword() {
  separator();
  log('TEST 7: POST /auth/forgot-password - Solicitar recuperação', 'blue');
  separator();
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/forgot-password`, {
      email: TEST_USER.email
    });
    
    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }
    
    if (!response.data.message) {
      throw new Error('Mensagem não retornada');
    }
    
    logSuccess('Solicitar recuperação de senha');
    logInfo(`   Message: ${response.data.message}`);
    logWarning('   ⚠️  Copie o token que aparece no console do servidor!');
    logWarning('   ⚠️  Atualize a variável resetToken no código e execute novamente');
    logWarning('   ⚠️  Ou pule o teste 8 (Reset Password)');
    
    // Aguardar usuário copiar o token
    // Em automação real, você buscaria do banco ou usaria mocks
    
    return true;
  } catch (error) {
    logError('Solicitar recuperação de senha', error);
    return false;
  }
}

async function test8_ResetPassword() {
  separator();
  log('TEST 8: POST /auth/reset-password - Resetar senha com token', 'blue');
  separator();
  
  // Verificar se temos um token para testar
  if (!resetToken || resetToken === '') {
    logWarning('⚠️  PULADO: Reset token não fornecido');
    logInfo('   Para testar este endpoint:');
    logInfo('   1. Execute o teste 7 (Forgot Password)');
    logInfo('   2. Copie o token do console do servidor');
    logInfo('   3. Atualize a variável resetToken no código');
    logInfo('   4. Execute novamente');
    return true;
  }
  
  try {
    const newPassword = 'senhaResetada789';
    
    const response = await axios.post(`${BASE_URL}/auth/reset-password`, {
      token: resetToken,
      newPassword: newPassword
    });
    
    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }
    
    if (response.data.message !== 'Password has been reset successfully') {
      throw new Error('Mensagem de sucesso não retornada');
    }
    
    // Atualizar senha do usuário de teste
    TEST_USER.password = newPassword;
    
    logSuccess('Resetar senha com token');
    logInfo(`   Senha resetada para: "${newPassword}"`);
    
    return true;
  } catch (error) {
    logError('Resetar senha com token', error);
    return false;
  }
}

async function test9_Logout() {
  separator();
  log('TEST 9: POST /auth/logout - Fazer logout', 'blue');
  separator();
  
  try {
    const response = await axios.post(
      `${BASE_URL}/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    
    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }
    
    if (response.data.message !== 'Logout successful') {
      throw new Error('Mensagem de sucesso não retornada');
    }
    
    logSuccess('Logout');
    logInfo(`   Refresh token invalidado no banco`);
    
    return true;
  } catch (error) {
    logError('Logout', error);
    return false;
  }
}

async function test10_FailedLoginAfterLogout() {
  separator();
  log('TEST 10: Verificar que refresh token foi invalidado', 'blue');
  separator();
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/refresh`, {
      refreshToken: refreshToken
    });
    
    // Se chegou aqui, o teste FALHOU (deveria dar erro)
    logError('Refresh token deveria estar invalidado', new Error('Token ainda válido'));
    return false;
    
  } catch (error) {
    // Esperamos um erro 401
    if (error.response && error.response.status === 401) {
      logSuccess('Refresh token invalidado corretamente após logout');
      logInfo(`   Erro esperado: ${error.response.data.message}`);
      return true;
    } else {
      logError('Erro inesperado ao testar refresh token invalidado', error);
      return false;
    }
  }
}

async function test11_LoginAgain() {
  separator();
  console.log('TEST 11: POST /auth/login - Fazer login novamente');
  separator();
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    if (response.status !== 200) {
      throw new Error(`Status esperado: 200, recebido: ${response.status}`);
    }
    
    // Atualizar tokens
    accessToken = response.data.accessToken;
    refreshToken = response.data.refreshToken;
    
    logSuccess('Login novamente após logout');
    logInfo(`   Novos tokens gerados`);
    
    return true;
  } catch (error) {
    logError('Login novamente', error);
    return false;
  }
}

// ========================================
// TESTES DE VALIDAÇÃO (CASOS DE ERRO)
// ========================================

async function testError1_RegisterDuplicateEmail() {
  separator();
  log('TEST ERROR 1: Registro com email duplicado', 'blue');
  separator();
  
  try {
    await axios.post(`${BASE_URL}/auth/register`, TEST_USER);
    
    // Se chegou aqui, o teste FALHOU
    logError('Deveria retornar erro 409', new Error('Email duplicado aceito'));
    return false;
    
  } catch (error) {
    if (error.response && error.response.status === 409) {
      logSuccess('Email duplicado rejeitado corretamente');
      logInfo(`   Erro: ${error.response.data.message}`);
      return true;
    } else {
      logError('Erro inesperado', error);
      return false;
    }
  }
}

async function testError2_LoginInvalidCredentials() {
  separator();
  log('TEST ERROR 2: Login com credenciais inválidas', 'blue');
  separator();
  
  try {
    await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: 'senhaErrada'
    });
    
    logError('Deveria retornar erro 401', new Error('Credenciais inválidas aceitas'));
    return false;
    
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logSuccess('Credenciais inválidas rejeitadas');
      logInfo(`   Erro: ${error.response.data.message}`);
      return true;
    } else {
      logError('Erro inesperado', error);
      return false;
    }
  }
}

async function testError3_GetProfileWithoutToken() {
  separator();
  log('TEST ERROR 3: Acessar perfil sem token', 'blue');
  separator();
  
  try {
    await axios.get(`${BASE_URL}/auth/me`);
    
    logError('Deveria retornar erro 401', new Error('Acesso sem token permitido'));
    return false;
    
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logSuccess('Acesso negado sem token');
      logInfo(`   Erro: ${error.response.data.message}`);
      return true;
    } else {
      logError('Erro inesperado', error);
      return false;
    }
  }
}

async function testError4_ChangePasswordWrong() {
  separator();
  log('TEST ERROR 4: Trocar senha com senha atual incorreta', 'blue');
  separator();
  
  try {
    await axios.patch(
      `${BASE_URL}/auth/change-password`,
      {
        currentPassword: 'senhaErrada',
        newPassword: 'novaSenha789'
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    
    logError('Deveria retornar erro 401', new Error('Senha incorreta aceita'));
    return false;
    
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logSuccess('Senha atual incorreta rejeitada');
      logInfo(`   Erro: ${error.response.data.message}`);
      return true;
    } else {
      logError('Erro inesperado', error);
      return false;
    }
  }
}

async function testError5_ResetPasswordInvalidToken() {
  separator();
  log('TEST ERROR 5: Reset password com token inválido', 'blue');
  separator();
  
  try {
    await axios.post(`${BASE_URL}/auth/reset-password`, {
      token: 'token_invalido_123',
      newPassword: 'novaSenha999'
    });
    
    logError('Deveria retornar erro 400', new Error('Token inválido aceito'));
    return false;
    
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logSuccess('Token inválido rejeitado');
      logInfo(`   Erro: ${error.response.data.message}`);
      return true;
    } else {
      logError('Erro inesperado', error);
      return false;
    }
  }
}

// ========================================
// EXECUTAR TODOS OS TESTES
// ========================================

async function runAllTests() {
  console.log('\n');
  separator();
  console.log('🧪 INICIANDO TESTES DE AUTOMAÇÃO - MÓDULO AUTH');
  console.log('SuperPet API');
  separator();
  
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test User Email: ${TEST_USER.email}`);
  console.log('');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  // Array de testes
  const tests = [
    // Testes de sucesso
    { name: 'Register', fn: test1_Register },
    { name: 'Login', fn: test2_Login },
    { name: 'Get Profile', fn: test3_GetProfile },
    { name: 'Change Password', fn: test4_ChangePassword },
    { name: 'Login com nova senha', fn: test5_LoginWithNewPassword },
    { name: 'Refresh Token', fn: test6_RefreshToken },
    { name: 'Forgot Password', fn: test7_ForgotPassword },
    { name: 'Reset Password', fn: test8_ResetPassword },
    { name: 'Logout', fn: test9_Logout },
    { name: 'Token invalidado após logout', fn: test10_FailedLoginAfterLogout },
    { name: 'Login após logout', fn: test11_LoginAgain },
    
    // Testes de erro
    { name: 'Email duplicado', fn: testError1_RegisterDuplicateEmail },
    { name: 'Credenciais inválidas', fn: testError2_LoginInvalidCredentials },
    { name: 'Acesso sem token', fn: testError3_GetProfileWithoutToken },
    { name: 'Senha atual incorreta', fn: testError4_ChangePasswordWrong },
    { name: 'Token de reset inválido', fn: testError5_ResetPasswordInvalidToken },
  ];
  
  // Executar testes sequencialmente
  for (const test of tests) {
    results.total++;
    const passed = await test.fn();
    
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Aguardar um pouco entre testes
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Resumo final
  console.log('');
  separator();
  console.log('📊 RESUMO DOS TESTES');
  separator();
  
  console.log(`Total de testes: ${results.total}`);
  console.log(`✅ Passaram: ${results.passed}`);
  console.log(`❌ Falharam: ${results.failed}`);
  console.log(`Taxa de sucesso: ${((results.passed / results.total) * 100).toFixed(2)}%`);
  
  separator();
  
  if (results.failed === 0) {
    console.log('🎉 TODOS OS TESTES PASSARAM!');
  } else {
    console.log('⚠️  ALGUNS TESTES FALHARAM');
  }
  
  separator();
  console.log('');
  
  // Exit code
  process.exit(results.failed > 0 ? 1 : 0);
}

// ========================================
// VERIFICAR SE SERVIDOR ESTÁ RODANDO
// ========================================

async function checkServer() {
  try {
    await axios.get(BASE_URL);
    console.log('✅ Servidor está rodando!\n');
    return true;
  } catch (error) {
    console.log('❌ ERRO: Servidor não está rodando!');
    console.log('   Inicie o servidor com: npm run start:local');
    console.log('   Aguarde alguns segundos e execute novamente');
    return false;
  }
}

// ========================================
// MAIN
// ========================================

(async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    process.exit(1);
  }
  
  await runAllTests();
})();

