# 🧪 Testes Automatizados - SuperPet API

## 📋 Visão Geral

Esta estrutura de testes automatizados foi projetada para ser **modular**, **eficiente** e **escalável**. Os testes são organizados por **categorias** e **features**, com execução **paralela** quando possível.

## 🏗️ Estrutura

```
test/automation/
├── core/                          # Testes fundamentais
│   ├── auth.test.js              # Testes completos de autenticação
│   ├── saas.test.js              # Testes completos de SaaS
│   └── helpers/                   # Helpers reutilizáveis
│       ├── auth-helper.js         # Métodos específicos de auth
│       └── saas-helper.js         # Métodos específicos de SaaS
├── features/                      # Testes por feature
│   ├── pdv.test.js               # Testes da feature PDV
│   ├── inventory.test.js         # Testes da feature Inventory
│   └── ...                       # Outras features
└── run-all.js                    # Orquestrador principal
```

## 🚀 Como Executar

### Executar Todos os Testes
```bash
npm run test:automation:all
```

### Executar Testes Específicos
```bash
# Testes de autenticação
npm run test:automation:auth

# Testes de SaaS
npm run test:automation:saas

# Testes da feature PDV
npm run test:automation:pdv
```

## 🔧 Helpers Disponíveis

### AuthHelper
Métodos para autenticação e criação de usuários:

```javascript
const AuthHelper = require('./core/helpers/auth-helper');
const authHelper = new AuthHelper();

// Login como SUPER_ADMIN
const superAdminToken = await authHelper.loginSuperAdmin();

// Criar organização
const org = await authHelper.createTestOrganization(superAdminToken);

// Criar OWNER
const owner = await authHelper.createTestOwner(superAdminToken, org.id);

// Login do OWNER
const ownerToken = await authHelper.loginOwner(owner.user.email, 'senha123');

// Criar STAFF
const staff = await authHelper.createTestStaff(ownerToken, org.id, storeId);

// Criar customer
const customer = await authHelper.createCustomer(ownerToken, org.id);
```

### SaasHelper
Métodos para configuração de ambiente SaaS:

```javascript
const SaasHelper = require('./core/helpers/saas-helper');
const saasHelper = new SaasHelper();

// Setup completo: Org + Store + Owner + Staff + Customer
const env = await saasHelper.setupCompleteSaasEnvironment();

// Habilitar feature para loja
await saasHelper.enableFeatureForStore(
  env.ownerToken, 
  env.store.id, 
  'PDV_POINT_OF_SALE',
  { maxConcurrentCarts: 50 }
);

// Verificar se feature está habilitada
const isEnabled = await saasHelper.isFeatureEnabled(
  env.ownerToken, 
  env.store.id, 
  'PDV_POINT_OF_SALE'
);

// Criar segunda organização para testes de isolamento
const org2 = await saasHelper.createSecondOrganization();

// Testar isolamento SaaS
const isIsolated = await saasHelper.testSaasIsolation(org1, org2, testFunction);

// Obter headers padrão
const headers = saasHelper.getHeaders(token, orgId);
```

## 🛒 Como Criar Testes para Nova Feature

### 1. Criar arquivo de teste
```bash
# Criar: test/automation/features/nova-feature.test.js
```

### 2. Estrutura básica
```javascript
const SaasHelper = require('../core/helpers/saas-helper');
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

class NovaFeatureTests {
  constructor() {
    this.saasHelper = new SaasHelper();
    this.results = { passed: 0, failed: 0, tests: [] };
  }

  async runAllTests() {
    console.log('🆕 INICIANDO TESTES DA FEATURE NOVA-FEATURE');
    console.log('=' .repeat(60));

    try {
      await this.testFeatureBlocking();
      await this.testFeatureEnabling();
      await this.testFeatureOperations();
      await this.testSaasIsolation();

      this.printResults();
    } catch (error) {
      console.error('❌ Erro geral nos testes:', error.message);
    }
  }

  async testFeatureBlocking() {
    // Testar bloqueio sem feature habilitada
  }

  async testFeatureEnabling() {
    // Testar habilitação da feature
  }

  async testFeatureOperations() {
    // Testar operações da feature
  }

  async testSaasIsolation() {
    // Testar isolamento SaaS
  }

  addResult(testName, passed, message) {
    // Adicionar resultado do teste
  }

  printResults() {
    // Imprimir resultados
  }
}

module.exports = NovaFeatureTests;
```

### 3. Adicionar ao orquestrador
```javascript
// Em test/automation/run-all.js
const NovaFeatureTests = require('./features/nova-feature.test');

async runFeatureTests() {
  const novaFeatureTests = new NovaFeatureTests();
  await novaFeatureTests.runAllTests();
  return novaFeatureTests.results;
}
```

### 4. Adicionar script no package.json
```json
{
  "scripts": {
    "test:automation:nova-feature": "node test/automation/features/nova-feature.test.js"
  }
}
```

## 🎯 Padrões de Teste

### 1. Teste de Bloqueio
Sempre testar se a feature bloqueia acesso quando não habilitada:
```javascript
try {
  await axios.post(`${BASE_URL}/v1/nova-feature/endpoint`, data, headers);
  this.addResult('Bloqueio sem Feature', false, 'Acesso permitido sem feature');
} catch (error) {
  if (error.response?.status === 403 && error.response?.data?.message === 'FEATURE_NOT_ENABLED') {
    this.addResult('Bloqueio sem Feature', true, 'Feature bloqueou acesso (403 FEATURE_NOT_ENABLED)');
  }
}
```

### 2. Teste de Habilitação
Testar se a feature pode ser habilitada:
```javascript
await this.saasHelper.enableFeatureForStore(ownerToken, storeId, 'NOVA_FEATURE');
const isEnabled = await this.saasHelper.isFeatureEnabled(ownerToken, storeId, 'NOVA_FEATURE');
```

### 3. Teste de Operações
Testar operações principais da feature:
```javascript
// CREATE
const createResponse = await axios.post(`${BASE_URL}/v1/nova-feature`, data, headers);

// READ
const readResponse = await axios.get(`${BASE_URL}/v1/nova-feature/${id}`, headers);

// UPDATE
const updateResponse = await axios.put(`${BASE_URL}/v1/nova-feature/${id}`, data, headers);

// DELETE
await axios.delete(`${BASE_URL}/v1/nova-feature/${id}`, headers);
```

### 4. Teste de Isolamento SaaS
Testar se organizações não podem acessar dados umas das outras:
```javascript
const org1 = await this.saasHelper.setupCompleteSaasEnvironment();
const org2 = await this.saasHelper.createSecondOrganization();

try {
  await axios.get(`${BASE_URL}/v1/nova-feature/${org1ResourceId}`, 
    this.saasHelper.getHeaders(org2.ownerToken, org2.organization.id));
  this.addResult('Isolamento SaaS', false, 'Org2 acessou dados da Org1');
} catch (error) {
  if (error.response?.status === 403 || error.response?.status === 404) {
    this.addResult('Isolamento SaaS', true, 'Isolamento funcionando (403/404)');
  }
}
```

## 📊 Execução Paralela

Os testes são executados em paralelo quando possível:

1. **Core Tests** (Auth + SaaS) - Executam em paralelo
2. **Feature Tests** - Executam sequencialmente (podem depender dos core)
3. **Dentro de cada feature** - Testes executam sequencialmente

## 🔄 Fluxo de Execução

```
🚀 INICIANDO SUITE COMPLETA DE TESTES
├── 🔐 Core Tests (paralelo)
│   ├── Auth Tests
│   └── SaaS Tests
├── 🛒 Feature Tests (sequencial)
│   ├── PDV Tests
│   ├── Inventory Tests
│   └── ... outras features
└── 📊 Resultados Consolidados
```

## 🎉 Benefícios

- ✅ **Modular**: Cada feature tem seus próprios testes
- ✅ **Reutilizável**: Helpers compartilhados entre features
- ✅ **Eficiente**: Execução paralela quando possível
- ✅ **Escalável**: Fácil adicionar novas features
- ✅ **Consistente**: Padrões uniformes de teste
- ✅ **Completo**: Cobertura de Auth, SaaS e Features

## 🚨 Pré-requisitos

1. **API rodando**: `npm run start:local`
2. **Banco limpo**: `npm run test:database:reset`
3. **Seed executado**: Dados iniciais carregados

## 📝 Logs e Resultados

Cada teste produz logs detalhados e resultados consolidados:

```
🎯 RESULTADOS FINAIS DA SUITE DE TESTES
📊 RESUMO POR CATEGORIA:
🔐 Auth:     7✅ 0❌ (100.0%)
🏢 SaaS:    6✅ 0❌ (100.0%)
🛒 Features: 5✅ 0❌ (100.0%)

📈 TOTAL GERAL:
✅ Passou: 18
❌ Falhou: 0
🎯 Taxa de Sucesso Geral: 100.0%
⏱️  Tempo Total: 45.2s
```