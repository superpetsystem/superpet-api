const axios = require('axios');
const AuthHelper = require('../core/helpers/auth-helper');
const SaasHelper = require('../core/helpers/saas-helper');

const BASE_URL = 'http://localhost:3000';

class LiveCamTestSuite {
  constructor() {
    this.authHelper = new AuthHelper();
    this.saasHelper = new SaasHelper();
    this.results = [];
  }

  addResult(testName, passed, message) {
    this.results.push({ testName, passed, message });
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${message}`);
  }

  async runAllTests() {
    console.log('📹 INICIANDO TESTES DA FEATURE LIVE CAM');
    console.log('============================================================');

    try {
      await this.testLiveCamManagement();
      await this.testLiveCamIsolation();
      await this.testLiveCamFeatures();
    } catch (error) {
      console.error('❌ Erro geral nos testes:', error.message);
    }

    this.printResults();
  }

  async testLiveCamManagement() {
    console.log('\n1. 🧪 Testando gerenciamento de live cam...');
    try {
      // Configurar ambiente SaaS completo
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Habilitar feature de live cam
      await this.saasHelper.enableFeature(environment.store.id, 'LIVE_CAM', environment.ownerToken);
      
      // Criar stream de live cam
      const stream = await this.createLiveCamStream(environment.ownerToken, environment.organization.id, environment.store.id);
      
      // Listar streams
      const streams = await this.listLiveCamStreams(environment.ownerToken, environment.organization.id, environment.store.id);
      
      // Deletar stream
      await this.deleteLiveCamStream(stream.id, environment.ownerToken, environment.organization.id, environment.store.id);
      
      this.addResult('Gerenciamento de Live Cam', true, 'Stream criado, listado e deletado com sucesso');
    } catch (error) {
      this.addResult('Gerenciamento de Live Cam', false, error.message);
    }
  }

  async testLiveCamIsolation() {
    console.log('\n2. 🧪 Testando isolamento SaaS do live cam...');
    try {
      // Configurar duas organizações
      const org1 = await this.saasHelper.setupCompleteSaasEnvironment();
      const org2 = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Habilitar feature em ambas
      await this.saasHelper.enableFeature(org1.store.id, 'LIVE_CAM', org1.ownerToken);
      await this.saasHelper.enableFeature(org2.store.id, 'LIVE_CAM', org2.ownerToken);
      
      // Criar stream na Org1
      const stream1 = await this.createLiveCamStream(org1.ownerToken, org1.organization.id, org1.store.id);
      
      // Tentar acessar stream da Org1 usando token da Org2
      try {
        await this.getLiveCamStream(stream1.id, org2.ownerToken, org2.organization.id);
        this.addResult('Isolamento SaaS do Live Cam', false, 'Org2 conseguiu acessar stream da Org1!');
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 404) {
          this.addResult('Isolamento SaaS do Live Cam', true, 'Isolamento funcionando (403/404)');
        } else {
          this.addResult('Isolamento SaaS do Live Cam', false, error.message);
        }
      }
    } catch (error) {
      this.addResult('Isolamento SaaS do Live Cam', false, error.message);
    }
  }

  async testLiveCamFeatures() {
    console.log('\n3. 🧪 Testando habilitação/desabilitação de features...');
    try {
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Tentar criar stream sem feature habilitada
      try {
        await this.createLiveCamStream(environment.ownerToken, environment.organization.id, environment.store.id);
        this.addResult('Habilitação/Desabilitação de Features', false, 'Stream criado sem feature habilitada!');
      } catch (error) {
        if (error.response?.status === 403) {
          // Habilitar feature
          await this.saasHelper.enableFeature(environment.store.id, 'LIVE_CAM', environment.ownerToken);
          
          // Criar stream com feature habilitada
          const stream = await this.createLiveCamStream(environment.ownerToken, environment.organization.id, environment.store.id);
          
          // Desabilitar feature
          await this.saasHelper.disableFeature(environment.store.id, 'LIVE_CAM', environment.ownerToken);
          
          // Tentar criar outro stream
          try {
            await this.createLiveCamStream(environment.ownerToken, environment.organization.id, environment.store.id);
            this.addResult('Habilitação/Desabilitação de Features', false, 'Stream criado após desabilitação!');
          } catch (error) {
            if (error.response?.status === 403) {
              this.addResult('Habilitação/Desabilitação de Features', true, 'Feature bloqueou criação após desabilitação (403 FEATURE_NOT_ENABLED)');
            } else {
              this.addResult('Habilitação/Desabilitação de Features', false, error.message);
            }
          }
        } else {
          this.addResult('Habilitação/Desabilitação de Features', false, error.message);
        }
      }
    } catch (error) {
      this.addResult('Habilitação/Desabilitação de Features', false, error.message);
    }
  }

  async createLiveCamStream(token, orgId, storeId) {
    const streamData = {
      name: 'Stream Teste',
      description: 'Stream para teste',
      isActive: true,
    };

    const response = await axios.post(`${BASE_URL}/stores/${storeId}/live-cam/streams`, streamData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Stream criado: ${response.data.id}`);
    return response.data;
  }

  async listLiveCamStreams(token, orgId, storeId) {
    const response = await axios.get(`${BASE_URL}/stores/${storeId}/live-cam/streams`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Streams listados: ${response.data.length}`);
    return response.data;
  }

  async getLiveCamStream(streamId, token, orgId) {
    const response = await axios.get(`${BASE_URL}/live-cam/streams/${streamId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    return response.data;
  }

  async deleteLiveCamStream(streamId, token, orgId, storeId) {
    await axios.delete(`${BASE_URL}/stores/${storeId}/live-cam/streams/${streamId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Stream deletado: ${streamId}`);
  }

  printResults() {
    console.log('\n============================================================');
    console.log('📊 RESULTADOS DOS TESTES DA FEATURE LIVE CAM');
    console.log('============================================================');
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    
    console.log(`✅ Passou: ${passed}`);
    console.log(`❌ Falhou: ${failed}`);
    console.log(`📈 Total: ${total}`);
    console.log(`🎯 Taxa de Sucesso: ${successRate}%`);
    
    if (failed > 0) {
      console.log('\n❌ Testes que falharam:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`   - ${result.testName}: ${result.message}`);
      });
    }
    
    console.log('============================================================');
  }
}

module.exports = LiveCamTestSuite;
