const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

class AuthHelper {
  constructor() {
    this.tokens = {};
    this.users = {};
  }

  /**
   * Login como SUPER_ADMIN
   */
  async loginSuperAdmin() {
    if (this.tokens.superAdmin) {
      return this.tokens.superAdmin;
    }

    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'superadmin@superpet.com',
        password: 'Super@2024!Admin',
      });
      
      this.tokens.superAdmin = response.data.access_token;
      this.users.superAdmin = response.data.user;
      
      console.log('✅ SUPER_ADMIN autenticado');
      return this.tokens.superAdmin;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      console.error('❌ Erro ao fazer login como SUPER_ADMIN:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Criar organização e retornar dados
   */
  async createTestOrganization(superAdminToken) {
    const timestamp = Date.now();
    const orgData = {
      name: `Test Org - ${timestamp}`,
      slug: `test-org-${timestamp}`,
      plan: 'PRO',
    };

    try {
      const response = await axios.post(`${BASE_URL}/admin/organizations`, orgData, {
        headers: { Authorization: `Bearer ${superAdminToken}` }
      });
      
      console.log(`✅ Organização criada: ${response.data.id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      console.error('❌ Erro ao criar organização:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Criar OWNER e retornar dados
   */
  async createTestOwner(superAdminToken, orgId) {
    const timestamp = Date.now();
    const ownerData = {
      name: 'Test Owner',
      email: `owner_${timestamp}@test.com`,
      password: 'senha123',
    };

    try {
      const response = await axios.post(`${BASE_URL}/admin/organizations/${orgId}/owners`, ownerData, {
        headers: { Authorization: `Bearer ${superAdminToken}` }
      });
      
      console.log(`✅ OWNER criado: ${response.data.user.email}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      console.error('❌ Erro ao criar OWNER:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Login do OWNER
   */
  async loginOwner(email, password) {
    const key = `owner_${email}`;
    
    if (this.tokens[key]) {
      return this.tokens[key];
    }

    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password,
      });
      
      this.tokens[key] = response.data.access_token;
      this.users[key] = response.data.user;
      
      console.log(`✅ OWNER ${email} autenticado`);
      return this.tokens[key];
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      console.error(`❌ Erro ao fazer login do OWNER ${email}:`, errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Criar STAFF e retornar dados
   */
  async createTestStaff(ownerToken, orgId, storeId) {
    const timestamp = Date.now();
    const staffData = {
      name: 'Test Staff',
      email: `staff_${timestamp}@test.com`,
      password: 'senha123',
      role: 'STAFF',
    };

    try {
      const response = await axios.post(`${BASE_URL}/employees`, staffData, {
        headers: { 
          Authorization: `Bearer ${ownerToken}`,
          'X-Org-Id': orgId
        }
      });
      
      console.log(`✅ STAFF criado: ${response.data.id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      console.error('❌ Erro ao criar STAFF:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Login do STAFF
   */
  async loginStaff(email, password) {
    const key = `staff_${email}`;
    
    if (this.tokens[key]) {
      return this.tokens[key];
    }

    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password,
      });
      
      this.tokens[key] = response.data.access_token;
      this.users[key] = response.data.user;
      
      console.log(`✅ STAFF ${email} autenticado`);
      return this.tokens[key];
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      console.error(`❌ Erro ao fazer login do STAFF ${email}:`, errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Criar customer
   */
  async createCustomer(ownerToken, orgId, customerData = {}) {
    const defaultData = {
      name: 'Test Customer',
      phone: '+5592999999999',
    };

    const data = { ...defaultData, ...customerData };

    try {
      const response = await axios.post(`${BASE_URL}/customers`, data, {
        headers: { 
          Authorization: `Bearer ${ownerToken}`,
          'X-Org-Id': orgId
        }
      });
      
      console.log(`✅ Customer criado: ${response.data.id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      console.error('❌ Erro ao criar customer:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Limpar tokens (para testes isolados)
   */
  clearTokens() {
    this.tokens = {};
    this.users = {};
  }
}

module.exports = AuthHelper;
