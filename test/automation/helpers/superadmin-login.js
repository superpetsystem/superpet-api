const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

const SUPERADMIN_CREDENTIALS = {
  email: 'superadmin@superpet.com.br',
  password: 'superadmin123',
};

async function loginAsSuperAdmin() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, SUPERADMIN_CREDENTIALS);
    
    if (response.status === 200 && response.data.access_token) {
      return {
        accessToken: response.data.access_token,
        user: response.data.user,
      };
    }
    
    throw new Error('Login failed');
  } catch (error) {
    console.error('❌ Erro ao fazer login como SUPER_ADMIN:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { loginAsSuperAdmin, SUPERADMIN_CREDENTIALS };

