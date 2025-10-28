const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

/**
 * Login simples - registra um usuário e retorna o token
 * SEM executar a suite completa de Auth (evita logout/blacklist)
 */
async function loginSimple(userName = 'Test User') {
  const email = `test_${Date.now()}_${Math.random().toString(36).substring(7)}@superpet.com.br`;
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      email,
      name: userName,
      password: 'senha123',
    });

    return response.data.access_token;
  } catch (error) {
    throw new Error(`Failed to register user: ${error.response?.data?.message || error.message}`);
  }
}

module.exports = { loginSimple };

