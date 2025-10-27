const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

class AuthHelper {
  constructor() {
    this.tokens = {};
    this.users = {};
  }

  // Métodos específicos para diferentes necessidades
  async getSuperAdminToken() {
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
      return response.data.access_token;
    } catch (error) {
      console.error('❌ Erro ao fazer login como SUPER_ADMIN:', error.response?.data?.message || error.message);
      throw new Error('Invalid credentials');
    }
  }

  async createOrganization(superAdminToken, orgData = {}) {
    const defaultOrgData = {
      name: `Test Org ${Date.now()}`,
      slug: `test-org-${Date.now()}`,
      plan: 'PRO',
      limits: { employees: 50, stores: 10, monthlyAppointments: 5000 }
    };

    try {
      const response = await axios.post(`${BASE_URL}/admin/organizations`, 
        { ...defaultOrgData, ...orgData }, 
        { headers: { Authorization: `Bearer ${superAdminToken}` }}
      );
      
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar organização:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  async createOwner(superAdminToken, orgId, ownerData = {}) {
    const defaultOwnerData = {
      email: `owner_${Date.now()}@test.com`,
      name: 'Test Owner',
      password: 'senha123'
    };

    try {
      const response = await axios.post(`${BASE_URL}/admin/organizations/${orgId}/owners`, 
        { ...defaultOwnerData, ...ownerData }, 
        { headers: { Authorization: `Bearer ${superAdminToken}` }}
      );
      
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar OWNER:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  async loginOwner(email, password) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password,
      });
      
      return {
        token: response.data.access_token,
        user: response.data.user
      };
    } catch (error) {
      console.error('❌ Erro ao fazer login como OWNER:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  async createStaff(ownerToken, staffData = {}) {
    const defaultStaffData = {
      email: `staff_${Date.now()}@test.com`,
      name: 'Test Staff',
      password: 'senha123',
      role: 'STAFF'
    };

    try {
      const response = await axios.post(`${BASE_URL}/employees`, 
        { ...defaultStaffData, ...staffData }, 
        { 
          headers: { 
            Authorization: `Bearer ${ownerToken}`,
            'X-Organization-Id': '00000000-0000-0000-0000-000000000001'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar STAFF:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  async createCustomer(ownerToken, customerData = {}) {
    const defaultCustomerData = {
      name: 'Rodolfo Diego',
      email: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@example.com`,
      phone: '+5511999999999'
    };

    try {
      const response = await axios.post(`${BASE_URL}/customers`, 
        { ...defaultCustomerData, ...customerData }, 
        { 
          headers: { 
            Authorization: `Bearer ${ownerToken}`,
            'X-Organization-Id': '00000000-0000-0000-0000-000000000001'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar Customer:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  async validateToken(token) {
    try {
      const response = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao validar token:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  clearTokens() {
    this.tokens = {};
    this.users = {};
  }
}

module.exports = AuthHelper;
