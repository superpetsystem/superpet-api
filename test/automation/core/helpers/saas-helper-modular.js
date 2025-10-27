const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

class SaasHelper {
  constructor() {
    this.environments = {};
  }

  // Métodos específicos para diferentes necessidades SaaS
  async createStore(ownerToken, storeData = {}) {
    const defaultStoreData = {
      name: 'Loja Principal',
      code: `STORE_${Date.now()}`,
      address: {
        street: 'Rua Principal',
        number: '123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      },
      openingHours: { mon: [['08:00', '18:00']] },
      resourcesCatalog: ['grooming', 'boarding'],
      capacity: { grooming: 50, boarding: 30 }
    };

    try {
      const response = await axios.post(`${BASE_URL}/stores`, 
        { ...defaultStoreData, ...storeData }, 
        { 
          headers: { 
            Authorization: `Bearer ${ownerToken}`,
            'X-Organization-Id': '00000000-0000-0000-0000-000000000001'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar Store:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  async enableFeatureForStore(storeId, featureKey, ownerToken) {
    try {
      const response = await axios.put(`${BASE_URL}/stores/${storeId}/features/${featureKey}`, 
        { enabled: true, limits: { daily: 50 } }, 
        { 
          headers: { 
            Authorization: `Bearer ${ownerToken}`,
            'X-Organization-Id': '00000000-0000-0000-0000-000000000001'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao habilitar feature:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  async disableFeatureForStore(storeId, featureKey, ownerToken) {
    try {
      const response = await axios.put(`${BASE_URL}/stores/${storeId}/features/${featureKey}`, 
        { enabled: false }, 
        { 
          headers: { 
            Authorization: `Bearer ${ownerToken}`,
            'X-Organization-Id': '00000000-0000-0000-0000-000000000001'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao desabilitar feature:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  async isFeatureEnabled(storeId, featureKey, ownerToken) {
    try {
      const response = await axios.get(`${BASE_URL}/stores/${storeId}/features`, {
        headers: { 
          Authorization: `Bearer ${ownerToken}`,
          'X-Organization-Id': '00000000-0000-0000-0000-000000000001'
        }
      });
      
      const feature = response.data.find(f => f.key === featureKey);
      return feature ? feature.enabled : false;
    } catch (error) {
      console.error('❌ Erro ao verificar feature:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async createSecondOrganization(superAdminToken) {
    try {
      const orgData = {
        name: `Test Org 2 ${Date.now()}`,
        slug: `test-org2-${Date.now()}`,
        plan: 'PRO',
        limits: { employees: 50, stores: 10, monthlyAppointments: 5000 }
      };

      const response = await axios.post(`${BASE_URL}/admin/organizations`, 
        orgData, 
        { headers: { Authorization: `Bearer ${superAdminToken}` }}
      );
      
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar segunda organização:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  // Método para setup completo de ambiente SaaS
  async setupCompleteSaasEnvironment(authHelper) {
    try {
      // 1. Login como SUPER_ADMIN
      const superAdminToken = await authHelper.getSuperAdminToken();
      
      // 2. Criar organização
      const organization = await authHelper.createOrganization(superAdminToken);
      
      // 3. Criar OWNER
      const owner = await authHelper.createOwner(superAdminToken, organization.id);
      
      // 4. Login do OWNER
      const ownerLogin = await authHelper.loginOwner(owner.user.email, 'senha123');
      
      // 5. Criar Store
      const store = await this.createStore(ownerLogin.token);
      
      // 6. Criar Customer
      const customer = await authHelper.createCustomer(ownerLogin.token);
      
      return {
        superAdminToken,
        organization,
        owner,
        ownerToken: ownerLogin.token,
        store,
        customer
      };
    } catch (error) {
      console.error('❌ Erro ao configurar ambiente SaaS:', error.message);
      throw error;
    }
  }

  // Métodos de compatibilidade para testes existentes
  async enableFeature(storeId, featureKey, ownerToken) {
    return this.enableFeatureForStore(storeId, featureKey, ownerToken);
  }

  async disableFeature(storeId, featureKey, ownerToken) {
    return this.disableFeatureForStore(storeId, featureKey, ownerToken);
  }
}

module.exports = SaasHelper;
