const axios = require('axios');
const AuthHelper = require('../core/helpers/auth-helper');
const SaasHelper = require('../core/helpers/saas-helper');

const BASE_URL = 'http://localhost:3000';

class EmployeesTestSuite {
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
    console.log('👨‍💼 INICIANDO TESTES DA FEATURE EMPLOYEES');
    console.log('============================================================');

    try {
      await this.testEmployeesManagement();
      await this.testEmployeesIsolation();
      await this.testEmployeesFeatures();
    } catch (error) {
      console.error('❌ Erro geral nos testes:', error.message);
    }

    this.printResults();
  }

  async testEmployeesManagement() {
    console.log('\n1. 🧪 Testando gerenciamento de funcionários...');
    try {
      // Configurar ambiente SaaS completo
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Criar funcionário
      const employee = await this.createEmployee(environment.ownerToken, environment.organization.id, environment.store.id);
      
      // Listar funcionários
      const employees = await this.listEmployees(environment.ownerToken, environment.organization.id);
      
      // Obter funcionário específico
      const employeeDetails = await this.getEmployee(employee.id, environment.ownerToken, environment.organization.id);
      
      // Atualizar funcionário
      const updatedEmployee = await this.updateEmployee(employee.id, environment.ownerToken, environment.organization.id);
      
      this.addResult('Gerenciamento de Funcionários', true, 'Funcionário criado, listado, obtido e atualizado com sucesso');
    } catch (error) {
      this.addResult('Gerenciamento de Funcionários', false, error.message);
    }
  }

  async testEmployeesIsolation() {
    console.log('\n2. 🧪 Testando isolamento SaaS dos funcionários...');
    try {
      // Configurar duas organizações
      const org1 = await this.saasHelper.setupCompleteSaasEnvironment();
      const org2 = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Criar funcionário na Org1
      const employee1 = await this.createEmployee(org1.ownerToken, org1.organization.id, org1.store.id);
      
      // Tentar acessar funcionário da Org1 usando token da Org2
      try {
        await this.getEmployee(employee1.id, org2.ownerToken, org2.organization.id);
        this.addResult('Isolamento SaaS dos Funcionários', false, 'Org2 conseguiu acessar funcionário da Org1!');
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 404) {
          this.addResult('Isolamento SaaS dos Funcionários', true, 'Isolamento funcionando (403/404)');
        } else {
          this.addResult('Isolamento SaaS dos Funcionários', false, error.message);
        }
      }
    } catch (error) {
      this.addResult('Isolamento SaaS dos Funcionários', false, error.message);
    }
  }

  async testEmployeesFeatures() {
    console.log('\n3. 🧪 Testando funcionalidades de funcionários...');
    try {
      const environment = await this.saasHelper.setupCompleteSaasEnvironment();
      
      // Criar funcionário
      const employee = await this.createEmployee(environment.ownerToken, environment.organization.id, environment.store.id);
      
      // Listar funcionários por loja
      const storeEmployees = await this.listStoreEmployees(environment.store.id, environment.ownerToken, environment.organization.id);
      
      // Listar funcionários por role
      const staffEmployees = await this.listEmployeesByRole('STAFF', environment.ownerToken, environment.organization.id);
      
      // Verificar se as funcionalidades retornaram dados válidos
      const hasStoreEmployees = storeEmployees && Array.isArray(storeEmployees);
      const hasStaffEmployees = staffEmployees && Array.isArray(staffEmployees);
      
      if (hasStoreEmployees && hasStaffEmployees) {
        this.addResult('Funcionalidades de Funcionários', true, 'Funcionários listados e filtrados com sucesso');
      } else {
        this.addResult('Funcionalidades de Funcionários', false, 'Funcionalidades não retornaram dados válidos');
      }
    } catch (error) {
      this.addResult('Funcionalidades de Funcionários', false, error.message);
    }
  }

  async createEmployee(token, orgId, storeId) {
    const employeeData = {
      firstName: 'João',
      lastName: 'Funcionário',
      email: `joao.funcionario.${Date.now()}@test.com`,
      phone: '+5592999999999',
      jobTitle: 'STAFF',
      hireDate: new Date().toISOString().split('T')[0],
      salary: 2000.00,
      isActive: true,
      address: {
        street: 'Rua dos Funcionários',
        number: '456',
        city: 'Manaus',
        state: 'AM',
        zipCode: '69000-000'
      }
    };

    const response = await axios.post(`${BASE_URL}/employees`, employeeData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Organization-Id': orgId
      }
    });

    console.log(`✅ Funcionário criado: ${response.data.id}`);
    return response.data;
  }

  async listEmployees(token, orgId) {
    const response = await axios.get(`${BASE_URL}/employees`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Organization-Id': orgId
      }
    });

    console.log(`✅ Funcionários listados: ${response.data.length}`);
    return response.data;
  }

  async getEmployee(employeeId, token, orgId) {
    const response = await axios.get(`${BASE_URL}/employees/${employeeId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Funcionário obtido: ${employeeId}`);
    return response.data;
  }

  async updateEmployee(employeeId, token, orgId) {
    const updateData = {
      firstName: 'João Atualizado',
      lastName: 'Funcionário Atualizado',
      salary: 2500.00,
      isActive: true
    };

    const response = await axios.put(`${BASE_URL}/employees/${employeeId}`, updateData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Funcionário atualizado: ${employeeId}`);
    return response.data;
  }

  async listStoreEmployees(storeId, token, orgId) {
    const response = await axios.get(`${BASE_URL}/stores/${storeId}/employees`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Funcionários da loja listados: ${response.data.length}`);
    return response.data;
  }

  async listEmployeesByRole(role, token, orgId) {
    const response = await axios.get(`${BASE_URL}/organizations/${orgId}/employees?role=${role}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'X-Org-Id': orgId
      }
    });

    console.log(`✅ Funcionários por role listados: ${response.data.length}`);
    return response.data;
  }

  printResults() {
    console.log('\n============================================================');
    console.log('📊 RESULTADOS DOS TESTES DA FEATURE EMPLOYEES');
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

module.exports = EmployeesTestSuite;
