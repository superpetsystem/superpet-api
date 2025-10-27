const axios = require('axios');
const AuthHelper = require('./auth-helper');

const BASE_URL = 'http://localhost:3000';

class SaasHelper {
  constructor() {
    this.authHelper = new AuthHelper();
    this.testData = {};
  }

  /**
   * Setup completo de SaaS: Org + Store + Owner + Staff
   */
  async setupCompleteSaasEnvironment() {
    console.log('🏗️  Configurando ambiente SaaS completo...');

    // 1. Login SUPER_ADMIN
    const superAdminToken = await this.authHelper.loginSuperAdmin();

    // 2. Criar organização
    const org = await this.authHelper.createTestOrganization(superAdminToken);

    // 3. Criar loja
    const store = await this.createTestStore(superAdminToken, org.id);

    // 4. Criar OWNER
    const owner = await this.authHelper.createTestOwner(superAdminToken, org.id);

    // 5. Login OWNER
    const ownerToken = await this.authHelper.loginOwner(owner.user.email, 'senha123');

    // 6. Criar STAFF
    const staff = await this.authHelper.createTestStaff(ownerToken, org.id, store.id);

    // 7. Login STAFF (se staff foi criado com sucesso)
    let staffToken = null;
    if (staff && staff.userId) {
      // Para STAFF, precisamos obter o email do usuário através do userId
      // Por enquanto, vamos pular o login do STAFF
      console.log('⚠️  STAFF criado mas login não implementado (sem email na resposta)');
    }

    // 8. Criar customer
    const customer = await this.authHelper.createCustomer(ownerToken, org.id);

    const environment = {
      superAdminToken,
      organization: org,
      store: store,
      owner: owner,
      ownerToken,
      staff: staff,
      staffToken,
      customer: customer,
    };

    this.testData = environment;
    console.log('✅ Ambiente SaaS configurado com sucesso!');
    
    return environment;
  }

  /**
   * Criar loja de teste
   */
  async createTestStore(superAdminToken, orgId) {
    const timestamp = Date.now();
    const storeData = {
      code: `STORE_${timestamp}`,
      name: 'Test Store',
      timezone: 'America/Manaus',
      openingHours: { mon: [['08:00', '18:00']] },
      resourcesCatalog: ['GROOMER'],
      capacity: { GROOMER: 2 },
    };

    try {
      const response = await axios.post(`${BASE_URL}/admin/organizations/${orgId}/stores`, storeData, {
        headers: { Authorization: `Bearer ${superAdminToken}` }
      });
      
      console.log(`✅ Loja criada: ${response.data.id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      console.error('❌ Erro ao criar loja:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Habilitar feature para uma loja
   */
  async enableFeatureForStore(ownerToken, storeId, featureKey, limits = {}) {
    try {
      const response = await axios.put(`${BASE_URL}/stores/${storeId}/features/${featureKey}`, {
        enabled: true,
        limits: limits
      }, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      
      console.log(`✅ Feature ${featureKey} habilitada para loja ${storeId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      console.error(`❌ Erro ao habilitar feature ${featureKey}:`, errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Desabilitar feature para uma loja
   */
  async disableFeatureForStore(ownerToken, storeId, featureKey) {
    try {
      const response = await axios.put(`${BASE_URL}/stores/${storeId}/features/${featureKey}`, {
        enabled: false
      }, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      
      console.log(`✅ Feature ${featureKey} desabilitada para loja ${storeId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      console.error(`❌ Erro ao desabilitar feature ${featureKey}:`, errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Verificar se feature está habilitada
   */
  async isFeatureEnabled(ownerToken, storeId, featureKey) {
    try {
      const response = await axios.get(`${BASE_URL}/stores/${storeId}/features`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      
      const feature = response.data.find(f => f.featureKey === featureKey);
      return feature ? feature.enabled : false;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      console.error(`❌ Erro ao verificar feature ${featureKey}:`, errorMessage);
      return false;
    }
  }

  /**
   * Criar segunda organização para testes de isolamento
   */
  async createSecondOrganization() {
    console.log('🏢 Criando segunda organização para teste de isolamento...');
    
    const superAdminToken = await this.authHelper.loginSuperAdmin();
    const org2 = await this.authHelper.createTestOrganization(superAdminToken);
    const store2 = await this.createTestStore(superAdminToken, org2.id);
    const owner2 = await this.authHelper.createTestOwner(superAdminToken, org2.id);
    const owner2Token = await this.authHelper.loginOwner(owner2.user.email, 'senha123');
    const customer2 = await this.authHelper.createCustomer(owner2Token, org2.id);

    const secondOrg = {
      organization: org2,
      store: store2,
      owner: owner2,
      ownerToken: owner2Token,
      customer: customer2,
    };

    console.log('✅ Segunda organização criada para testes de isolamento');
    return secondOrg;
  }

  /**
   * Testar isolamento SaaS - tentar acesso cross-tenant
   */
  async testSaasIsolation(org1Data, org2Data, testFunction) {
    console.log('🔒 Testando isolamento SaaS...');
    
    try {
      // Tentar usar dados da Org1 para acessar recursos da Org2
      await testFunction(org1Data, org2Data);
      console.log('❌ FALHA: Isolamento SaaS não funcionou!');
      return false;
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.log('✅ SUCESSO: Isolamento SaaS funcionando (403/404)');
        return true;
      } else {
        console.log(`⚠️  Resposta inesperada: ${error.response?.status}`);
        return false;
      }
    }
  }

  /**
   * Limpar dados de teste
   */
  clearTestData() {
    this.testData = {};
    this.authHelper.clearTokens();
  }

  /**
   * Obter headers padrão para requests
   */
  getHeaders(token, orgId = null) {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    
    if (orgId) {
      headers['X-Org-Id'] = orgId;
    }
    
    return headers;
  }

  /**
   * Métodos de compatibilidade com os testes de features
   */
  async enableFeature(storeId, featureKey, ownerToken) {
    return this.enableFeatureForStore(ownerToken, storeId, featureKey);
  }

  async disableFeature(storeId, featureKey, ownerToken) {
    return this.disableFeatureForStore(ownerToken, storeId, featureKey);
  }
}

module.exports = SaasHelper;
